import { z } from 'zod';

// Common schemas
export const passwordSchema = z
  .string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
  })
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
  );

export const emailSchema = z
  .string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string',
  })
  .email('Invalid email address')
  .max(255, 'Email must be at most 255 characters');

// Auth schemas
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    }),
  })
  .strict();

// Tenant schemas
export const createTenantSchema = z
  .object({
    name: z
      .string({
        required_error: 'Tenant name is required',
        invalid_type_error: 'Tenant name must be a string',
      })
      .min(2, 'Tenant name must be at least 2 characters')
      .max(100, 'Tenant name must be at most 100 characters'),
    slug: z
      .string({
        required_error: 'Slug is required',
        invalid_type_error: 'Slug must be a string',
      })
      .min(2, 'Slug must be at least 2 characters')
      .max(50, 'Slug must be at most 50 characters')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug must contain only lowercase letters, numbers and hyphens'
      ),
  })
  .strict();

// Account schemas
export const accountTypeSchema = z.enum(['bank', 'cash', 'credit_card', 'investment', 'savings'], {
  errorMap: () => ({
    message: 'Account type must be one of: bank, cash, credit_card, investment, savings',
  }),
});

export const createAccountSchema = z
  .object({
    name: z
      .string({
        required_error: 'Account name is required',
        invalid_type_error: 'Account name must be a string',
      })
      .min(2, 'Account name must be at least 2 characters')
      .max(100, 'Account name must be at most 100 characters'),
    type: accountTypeSchema,
    initialBalance: z
      .number({
        invalid_type_error: 'Initial balance must be a number',
      })
      .min(0, 'Initial balance cannot be negative')
      .optional(),
    currency: z
      .string()
      .length(3, 'Currency must be a 3-letter ISO code')
      .default('BRL'),
    description: z.string().max(500).optional(),
  })
  .strict();

// Category schemas
export const categoryTypeSchema = z.enum(['income', 'expense'], {
  errorMap: () => ({
    message: 'Category type must be either income or expense',
  }),
});

export const createCategorySchema = z
  .object({
    name: z
      .string({
        required_error: 'Category name is required',
        invalid_type_error: 'Category name must be a string',
      })
      .min(2, 'Category name must be at least 2 characters')
      .max(100, 'Category name must be at most 100 characters'),
    type: categoryTypeSchema,
    color: z
      .string()
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Color must be a valid hex color code'
      )
      .optional(),
    icon: z
      .string()
      .max(50, 'Icon name must be at most 50 characters')
      .optional(),
    parentId: z
      .string()
      .uuid('Parent category ID must be a valid UUID')
      .optional(),
    isActive: z.boolean().default(true),
  })
  .strict();

// Transaction schemas
export const transactionTypeSchema = z.enum(['income', 'expense', 'transfer'], {
  errorMap: () => ({
    message: 'Transaction type must be one of: income, expense, transfer',
  }),
});

export const createTransactionSchema = z
  .object({
    accountId: z
      .string({
        required_error: 'Account ID is required',
        invalid_type_error: 'Account ID must be a string',
      })
      .uuid('Account ID must be a valid UUID'),
    categoryId: z
      .string({
        required_error: 'Category ID is required',
        invalid_type_error: 'Category ID must be a string',
      })
      .uuid('Category ID must be a valid UUID'),
    type: transactionTypeSchema,
    amount: z
      .number({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number',
      })
      .positive('Amount must be positive'),
    description: z
      .string()
      .max(500, 'Description must be at most 500 characters')
      .optional(),
    transactionDate: z.union(
      [
        z.string().datetime({
          message: 'Transaction date must be a valid ISO 8601 date string',
        }),
        z.date({
          invalid_type_error: 'Transaction date must be a valid Date object',
        }),
      ],
      {
        required_error: 'Transaction date is required',
        invalid_type_error:
          'Transaction date must be a valid date string or Date object',
      }
    ),
    tags: z
      .array(z.string().max(50, 'Each tag must be at most 50 characters'))
      .max(10, 'Maximum of 10 tags allowed')
      .optional(),
    reference: z.string().max(100).optional(),
    isRecurring: z.boolean().default(false),
    recurringId: z.string().uuid('Recurring ID must be a valid UUID').optional(),
    attachmentUrl: z.string().url('Invalid attachment URL').optional(),
  })
  .strict();

// Export types for use in the application
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.enum(['owner', 'admin', 'member']).optional(),
});

export const createTicketSchema = z.object({
  subject: z.string().min(5),
  description: z.string().min(10),
  priority: z.enum(['low', 'normal', 'high']).optional(),
});
