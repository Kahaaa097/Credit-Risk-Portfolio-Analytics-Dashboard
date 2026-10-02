import { z } from "zod";

const OptionalString = z.string().optional().or(z.literal(""));

const CommonQuerySchema = z.object({
  // Use z.string().min(1, '...').optional() for string fields that might be empty or missing
  branchId: z.string().min(1, "Vui lòng chọn chi nhánh"),
  period: OptionalString,
  productCode: OptionalString,
  purposeCode: OptionalString,
  currency: OptionalString,
  loanGroup: OptionalString,
  contractStatus: OptionalString,
  customerType: OptionalString,
});

export const FilterFormSchema = CommonQuerySchema.extend({
  dateFrom: OptionalString,
  dateTo: OptionalString,
  asOf: OptionalString,
}).refine(
  (data) => {
    // Custom validation: period must be in YYYY-MM format if present and not an empty string
    if (data.period && data.period.length > 0) {
      return /^\d{4}-\d{2}$/.test(data.period);
    }
    return true;
  },
  {
    message: "Định dạng phải là YYYY-MM",
    path: ["period"],
  },
);

export type FilterFormSchemaType = z.infer<typeof FilterFormSchema>;
