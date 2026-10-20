export type DatasetValueType =
  | "TEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "SINGLE_SELECT"
  | "MULTI_SELECT"
  | "URL"
  | "MEDIA";

export interface DatasetFieldDefinition {
  key: string;
  label: string;
  type: DatasetValueType;
  isRequired: boolean;
  options?: unknown;
}

export interface RecordValidationError {
  field: string;
  message: string;
}

export type RecordValidationResult =
  | {
      success: true;
      data: Record<string, unknown>;
      errors: [];
    }
  | {
      success: false;
      errors: RecordValidationError[];
    };

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (typeof value === "string" && value.trim() === "")
  );
}

function getAllowedOptions(options: unknown): string[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.flatMap((option): string[] => {
    if (typeof option === "string") {
      return [option];
    }

    if (
      typeof option === "object" &&
      option !== null &&
      "value" in option &&
      typeof option.value === "string"
    ) {
      return [option.value];
    }

    return [];
  });
}

function validateFieldValue(
  field: DatasetFieldDefinition,
  value: unknown,
): string | null {
  switch (field.type) {
    case "TEXT":
      return typeof value === "string"
        ? null
        : "Must be a string.";

    case "NUMBER":
      return typeof value === "number" && Number.isFinite(value)
        ? null
        : "Must be a finite number.";

    case "BOOLEAN":
      return typeof value === "boolean"
        ? null
        : "Must be true or false.";

    case "DATE": {
      if (typeof value !== "string") {
        return "Must be a date string.";
      }

      const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
      const parsed = new Date(value);

      if (Number.isNaN(parsed.getTime())) {
        return "Must be a valid date.";
      }

      if (dateOnly && parsed.toISOString().slice(0, 10) !== value) {
        return "Must be a valid calendar date.";
      }

      return null;
    }

    case "URL": {
      if (typeof value !== "string") {
        return "Must be a URL string.";
      }

      try {
        const url = new URL(value);

        return url.protocol === "http:" || url.protocol === "https:"
          ? null
          : "URL must use HTTP or HTTPS.";
      } catch {
        return "Must be a valid HTTP or HTTPS URL.";
      }
    }

    case "SINGLE_SELECT": {
      if (typeof value !== "string") {
        return "Must be a single selected option.";
      }

      const allowed = getAllowedOptions(field.options);

      if (allowed.length === 0) {
        return "This field has no configured options.";
      }

      return allowed.includes(value)
        ? null
        : "Value is not one of the configured options.";
    }

    case "MULTI_SELECT": {
      if (
        !Array.isArray(value) ||
        !value.every((item) => typeof item === "string")
      ) {
        return "Must be an array of selected options.";
      }

      const allowed = getAllowedOptions(field.options);

      if (allowed.length === 0) {
        return "This field has no configured options.";
      }

      return value.every((item) => allowed.includes(item))
        ? null
        : "One or more values are not configured options.";
    }

    case "MEDIA":
      return typeof value === "string" ||
        (Array.isArray(value) &&
          value.every((item) => typeof item === "string"))
        ? null
        : "Must be a media reference or an array of media references.";

    default:
      return "Unsupported field type.";
  }
}

export function validateDatasetRecord(
  fields: readonly DatasetFieldDefinition[],
  input: unknown,
): RecordValidationResult {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input)
  ) {
    return {
      success: false,
      errors: [
        {
          field: "_record",
          message: "Record data must be a JSON object.",
        },
      ],
    };
  }

  const inputData = input as Record<string, unknown>;
  const errors: RecordValidationError[] = [];
  const fieldKeys = new Set(fields.map((field) => field.key));

  for (const key of Object.keys(inputData)) {
    if (!fieldKeys.has(key)) {
      errors.push({
        field: key,
        message: "Unknown field. Add it to the dataset schema first.",
      });
    }
  }

  for (const field of fields) {
    const value = inputData[field.key];

    if (isEmpty(value)) {
      if (field.isRequired) {
        errors.push({
          field: field.key,
          message: `${field.label} is required.`,
        });
      }

      continue;
    }

    const message = validateFieldValue(field, value);

    if (message) {
      errors.push({
        field: field.key,
        message: `${field.label}: ${message}`,
      });
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: inputData,
    errors: [],
  };
}