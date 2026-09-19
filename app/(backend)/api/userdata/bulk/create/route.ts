import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

function replaceUndefinedWithNull<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => replaceUndefinedWithNull(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val === undefined) {
        result[key] = null;
      } else if (
        Array.isArray(val) ||
        (val !== null && typeof val === "object")
      ) {
        result[key] = replaceUndefinedWithNull(val);
      } else {
        result[key] = val;
      }
    }
    return result as unknown as T;
  }
  return (value === undefined ? (null as unknown as T) : value) as T;
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const body = await request.json();
    const { users } = body;

    console.log("[Bulk Create] Request received:", {
      timestamp: new Date().toISOString(),
      usersCount: users?.length || 0,
      hasUsers: !!users,
      isArray: Array.isArray(users),
      bodyKeys: Object.keys(body),
    });

    // Validate input
    if (!users || !Array.isArray(users) || users.length === 0) {
      console.log(
        "[Bulk Create] Validation failed: Empty or invalid users array",
        { users },
      );
      return NextResponse.json(
        {
          error: "Users array is required and must not be empty",
          details: "Provide at least one user object in the 'users' array",
          received: {
            users: users
              ? Array.isArray(users)
                ? `${users.length} items`
                : typeof users
              : "undefined",
          },
        },
        { status: 400 },
      );
    }

    // Validate each user has required field (name)
    const invalidUsers = users.filter(
      (user) =>
        !user.name || (typeof user.name === "string" && !user.name.trim()),
    );
    if (invalidUsers.length > 0) {
      console.log("[Bulk Create] Validation failed: Missing name field", {
        invalidCount: invalidUsers.length,
        totalUsers: users.length,
        examples: invalidUsers.slice(0, 3),
      });
      return NextResponse.json(
        {
          error: "All users must have a name",
          invalidCount: invalidUsers.length,
          totalUsers: users.length,
          details:
            "Check that the 'name' field is filled and not empty for all users",
        },
        { status: 400 },
      );
    }

    // Process and clean data
    const cleanedUsers = users.map((user) => {
      // Create base user object
      const userData = {
        name: user.name as string,
        email: user.email || null,
        nik: user.nik || null,
        nisn: user.nisn || null,
        roleId: user.roleId || null,
        gender: user.gender || null,
        birthPlace: user.birthPlace || null,
        birthDate: user.birthDate || null,
        address: user.address || null,
        parentPhone: user.parentPhone || null,
        academicYearId: user.academicYearId || null,
        classId: user.classId || null,
        tahfidzGroupId: user.tahfidzGroupId || null,
        branchId: user.branchId || null,
        enrollmentDate: user.enrollmentDate || null,
        graduationDate: user.graduationDate || null,
        employeeId: user.employeeId || null,
        position: user.position || null,
        startDate: user.startDate || null,
        endDate: user.endDate || null,
        status: user.status || "active",
        isActive: user.isActive !== undefined ? user.isActive : true,
        relation: user.relation || null,
        avatarUrl: user.avatarUrl || null,
        studentIds: user.studentIds || [],
        // foundationId selalu dari sesi, bukan dari body
        foundationId: t.foundationId,
      };

      return replaceUndefinedWithNull(userData);
    });

    // Validate foreign keys exist before bulk create
    const roleIds = cleanedUsers
      .map((u) => u.roleId)
      .filter((id): id is string => id !== null);

    const academicYearIds = cleanedUsers
      .map((u) => u.academicYearId)
      .filter((id): id is string => id !== null);

    const classIds = cleanedUsers
      .map((u) => u.classId)
      .filter((id): id is string => id !== null);

    const branchIds = cleanedUsers
      .map((u) => u.branchId)
      .filter((id): id is string => id !== null);

    const tahfidzGroupIds = cleanedUsers
      .map((u) => u.tahfidzGroupId)
      .filter((id): id is string => id !== null);

    // TahfidzGroup tidak punya relasi ke Branch (hanya branchId), jadi scope-nya lewat branch yayasan ini
    const tenantBranchIds =
      tahfidzGroupIds.length > 0
        ? (
            await prisma.branch.findMany({
              where: { foundationId: t.foundationId },
              select: { id: true },
            })
          ).map((branch) => branch.id)
        : [];

    // Check if referenced records exist dan memang milik yayasan pemanggil
    const [roles, academicYears, classes, branchs, tahfidzGroups] =
      await Promise.all([
        roleIds.length > 0
          ? prisma.role.findMany({
              // role bersama (foundationId NULL) tetap valid karena ikut tampil di daftar role
              where: {
                id: { in: roleIds },
                OR: [{ foundationId: t.foundationId }, { foundationId: null }],
              },
              select: { id: true },
            })
          : [],
        academicYearIds.length > 0
          ? prisma.academicYear.findMany({
              where: {
                id: { in: academicYearIds },
                foundationId: t.foundationId,
              },
              select: { id: true },
            })
          : [],
        classIds.length > 0
          ? prisma.class.findMany({
              where: {
                id: { in: classIds },
                branch: { foundationId: t.foundationId },
              },
              select: { id: true },
            })
          : [],
        branchIds.length > 0
          ? prisma.branch.findMany({
              where: { id: { in: branchIds }, foundationId: t.foundationId },
              select: { id: true },
            })
          : [],
        tahfidzGroupIds.length > 0
          ? prisma.tahfidzGroup.findMany({
              where: {
                id: { in: tahfidzGroupIds },
                branchId: { in: tenantBranchIds },
              },
              select: { id: true },
            })
          : [],
      ]);

    // Check for invalid references
    const foundRoleIds = new Set(roles.map((r) => r.id));
    const foundAcademicYearIds = new Set(academicYears.map((a) => a.id));
    const foundClassIds = new Set(classes.map((c) => c.id));
    const foundBranchIds = new Set(branchs.map((m) => m.id));
    const foundTahfidzGroupIds = new Set(tahfidzGroups.map((g) => g.id));

    const invalidRoles = roleIds.filter((id) => !foundRoleIds.has(id));
    const invalidAcademicYears = academicYearIds.filter(
      (id) => !foundAcademicYearIds.has(id),
    );
    const invalidClasses = classIds.filter((id) => !foundClassIds.has(id));
    const invalidBranchs = branchIds.filter((id) => !foundBranchIds.has(id));
    const invalidTahfidzGroups = tahfidzGroupIds.filter(
      (id) => !foundTahfidzGroupIds.has(id),
    );

    if (
      invalidRoles.length > 0 ||
      invalidAcademicYears.length > 0 ||
      invalidClasses.length > 0 ||
      invalidBranchs.length > 0 ||
      invalidTahfidzGroups.length > 0
    ) {
      console.log("[Bulk Create] Foreign key validation failed:", {
        invalidRoles: {
          count: invalidRoles.length,
          ids: invalidRoles.slice(0, 3),
        },
        invalidAcademicYears: {
          count: invalidAcademicYears.length,
          ids: invalidAcademicYears.slice(0, 3),
        },
        invalidClasses: {
          count: invalidClasses.length,
          ids: invalidClasses.slice(0, 3),
        },
        invalidBranchs: {
          count: invalidBranchs.length,
          ids: invalidBranchs.slice(0, 3),
        },
        invalidTahfidzGroups: {
          count: invalidTahfidzGroups.length,
          ids: invalidTahfidzGroups.slice(0, 3),
        },
        availableRecords: {
          roles: foundRoleIds.size,
          academicYears: foundAcademicYearIds.size,
          classes: foundClassIds.size,
          branchs: foundBranchIds.size,
          tahfidzGroups: foundTahfidzGroupIds.size,
        },
      });
      return NextResponse.json(
        {
          error: "Invalid foreign key references found",
          details: {
            invalidRoles:
              invalidRoles.length > 0
                ? {
                    count: invalidRoles.length,
                    samples: invalidRoles.slice(0, 3),
                  }
                : undefined,
            invalidAcademicYears:
              invalidAcademicYears.length > 0
                ? {
                    count: invalidAcademicYears.length,
                    samples: invalidAcademicYears.slice(0, 3),
                  }
                : undefined,
            invalidClasses:
              invalidClasses.length > 0
                ? {
                    count: invalidClasses.length,
                    samples: invalidClasses.slice(0, 3),
                  }
                : undefined,
            invalidBranchs:
              invalidBranchs.length > 0
                ? {
                    count: invalidBranchs.length,
                    samples: invalidBranchs.slice(0, 3),
                  }
                : undefined,
            invalidTahfidzGroups:
              invalidTahfidzGroups.length > 0
                ? {
                    count: invalidTahfidzGroups.length,
                    samples: invalidTahfidzGroups.slice(0, 3),
                  }
                : undefined,
          },
          availableRecords: {
            roles: foundRoleIds.size,
            academicYears: foundAcademicYearIds.size,
            classes: foundClassIds.size,
            branchs: foundBranchIds.size,
            tahfidzGroups: foundTahfidzGroupIds.size,
          },
          suggestion:
            "Verify that all IDs in your Excel file match the available options shown in the tables on the upload page. Note: tahfidzGroupId is optional and can be left empty.",
        },
        { status: 400 },
      );
    }
    console.log(cleanedUsers);

    console.log("[Bulk Create] Validation passed, creating users:", {
      count: cleanedUsers.length,
      timestamp: new Date().toISOString(),
    });

    // Bulk create users
    const result = await prisma.userData.createMany({
      data: cleanedUsers.map((user) => ({
        ...user,
        // ✅ Ensure tahfidzGroupId is null if empty string (Prisma constraint)
        tahfidzGroupId: user.tahfidzGroupId === "" ? null : user.tahfidzGroupId,
      })),
      skipDuplicates: false,
    });

    console.log("[Bulk Create] Success:", {
      created: result.count,
      total: users.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message: "Users created successfully",
        count: result.count,
        total: users.length,
      },
      { status: 201 },
    );
  } catch (error) {
    return handlePrismaError(error);
  }
}
