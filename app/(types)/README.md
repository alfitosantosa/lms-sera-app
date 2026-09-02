# TypeScript Types Directory

This directory contains all TypeScript type definitions for the LMS application.

## Structure

All types are organized by domain/feature:

### Core Types

- `userData.ts` - User and UserData types
- `academicyear-types.ts` - Academic year related types
- `roles-types.ts` - User roles and permissions

### Class & Schedule Types

- `class-types.ts` - Class/classroom types
- `schedule-types.ts` - Schedule and timetable types
- `subject-types.ts` - Subject/course types
- `attendance-types.ts` - Attendance tracking types
- `teacher-attendance.ts` - Teacher attendance specific types

### Payment Types

- `payment-types.ts` - Payment transaction types
- `payment-items-types.ts` - Individual payment item types
- `paymenttype-types.ts` - Payment type definitions
- `accountbank-types.ts` - Bank account types

### Academic Types

- `majors-types.ts` - Major/program types
- `tahfidz-group-types.ts` - Tahfidz group types
- `tahfidzrecord-types.ts` - Tahfidz record and Surah types
- `violation-types.ts` - Violation and violation type definitions

## Usage

### Import from centralized index:

\`\`\`typescript
import {
UserDataTypes,
PaymentTypes,
ScheduleTypes
} from "@/(types)";
\`\`\`

### Or import from specific files:

\`\`\`typescript
import { PaymentItemsTypes } from "@/(types)/types/payment-items-types";
\`\`\`

## Type Patterns

### API Response Types

Most types include optional relation fields that match Prisma's include patterns:

\`\`\`typescript
interface PaymentTypes {
id: string;
amount: number;
// ... other fields
student?: StudentPaymentTypes; // Optional relation
paymentItems?: PaymentItemTypes[];
}
\`\`\`

### Input Types

Separate input types for API mutations:

\`\`\`typescript
export interface PaymentItemsInput {
studentId: string;
paymentTypeId: string;
amount: number;
// ... required fields only
}
\`\`\`

### Date Handling

Dates are typed as `Date | string` to handle both Date objects and ISO strings:

\`\`\`typescript
interface PaymentTypes {
paymentDate: Date | string;
createdAt?: Date | string;
}
\`\`\`

### Numeric Values

Prisma Decimal fields are typed as `number | string`:

\`\`\`typescript
interface PaymentTypes {
amount: number | string; // Can be Decimal from DB or number in JS
}
\`\`\`

## Best Practices

1. **Use proper types instead of `any`**: Always import and use the appropriate type
2. **Relations are optional**: Include them in types as optional fields
3. **Create Input types**: Separate types for API request bodies
4. **Use Partial<T>**: For update operations where fields are optional
5. **Export all types**: Make sure new types are exported in `index.ts`

## Integration with Hooks

All React Query hooks use these types:

\`\`\`typescript
import { PaymentTypes } from "@/(types)";

export const useCreatePayment = () => {
return useMutation({
mutationFn: async (data: Partial<PaymentTypes>) => {
const res = await apiPost("/api/payment", data);
return res.data;
},
});
};
\`\`\`

## Integration with API Routes

Backend API routes should also use these types for type safety:

\`\`\`typescript
import { PaymentItemsInput } from "@/(types)/types/payment-items-types";

export async function POST(request: NextRequest) {
const body: PaymentItemsInput[] = await request.json();
// ... handle request
}
\`\`\`

## Maintaining Types

When updating the Prisma schema:

1. Update the corresponding type file
2. Add new relation interfaces if needed
3. Update Input types for new required fields
4. Export new types in `index.ts`
5. Update imports in hooks and components

## Type Safety Benefits

✅ Autocomplete in IDE
✅ Compile-time error checking  
✅ Better refactoring support
✅ Self-documenting code
✅ Reduced runtime errors
