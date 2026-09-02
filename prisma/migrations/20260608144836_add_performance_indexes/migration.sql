-- CreateIndex
CREATE INDEX "attendances_studentId_idx" ON "attendances"("studentId");

-- CreateIndex
CREATE INDEX "attendances_scheduleId_idx" ON "attendances"("scheduleId");

-- CreateIndex
CREATE INDEX "attendances_date_idx" ON "attendances"("date");

-- CreateIndex
CREATE INDEX "attendances_status_idx" ON "attendances"("status");

-- CreateIndex
CREATE INDEX "payment_items_paymentId_idx" ON "payment_items"("paymentId");

-- CreateIndex
CREATE INDEX "payment_items_studentId_idx" ON "payment_items"("studentId");

-- CreateIndex
CREATE INDEX "payment_items_paymentTypeId_idx" ON "payment_items"("paymentTypeId");

-- CreateIndex
CREATE INDEX "payment_items_isPaid_idx" ON "payment_items"("isPaid");

-- CreateIndex
CREATE INDEX "payments_studentId_idx" ON "payments"("studentId");

-- CreateIndex
CREATE INDEX "payments_majorId_idx" ON "payments"("majorId");

-- CreateIndex
CREATE INDEX "payments_accountBankId_idx" ON "payments"("accountBankId");

-- CreateIndex
CREATE INDEX "payments_bendaharaId_idx" ON "payments"("bendaharaId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");

-- CreateIndex
CREATE INDEX "payments_month_idx" ON "payments"("month");

-- CreateIndex
CREATE INDEX "schedules_classId_idx" ON "schedules"("classId");

-- CreateIndex
CREATE INDEX "schedules_subjectId_idx" ON "schedules"("subjectId");

-- CreateIndex
CREATE INDEX "schedules_teacherId_idx" ON "schedules"("teacherId");

-- CreateIndex
CREATE INDEX "schedules_academicYearId_idx" ON "schedules"("academicYearId");

-- CreateIndex
CREATE INDEX "schedules_dayOfWeek_idx" ON "schedules"("dayOfWeek");

-- CreateIndex
CREATE INDEX "schedules_tahfidzGroupId_idx" ON "schedules"("tahfidzGroupId");

-- CreateIndex
CREATE INDEX "user_data_academicYearId_idx" ON "user_data"("academicYearId");

-- CreateIndex
CREATE INDEX "user_data_classId_idx" ON "user_data"("classId");

-- CreateIndex
CREATE INDEX "user_data_majorId_idx" ON "user_data"("majorId");

-- CreateIndex
CREATE INDEX "user_data_roleId_idx" ON "user_data"("roleId");

-- CreateIndex
CREATE INDEX "user_data_tahfidzGroupId_idx" ON "user_data"("tahfidzGroupId");

-- CreateIndex
CREATE INDEX "user_data_status_idx" ON "user_data"("status");

-- CreateIndex
CREATE INDEX "user_data_email_idx" ON "user_data"("email");

-- CreateIndex
CREATE INDEX "violations_studentId_idx" ON "violations"("studentId");

-- CreateIndex
CREATE INDEX "violations_violationTypeId_idx" ON "violations"("violationTypeId");

-- CreateIndex
CREATE INDEX "violations_classId_idx" ON "violations"("classId");

-- CreateIndex
CREATE INDEX "violations_status_idx" ON "violations"("status");

-- CreateIndex
CREATE INDEX "violations_date_idx" ON "violations"("date");
