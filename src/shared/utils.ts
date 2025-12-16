export function covertObjectToSearchParams(obj: Record<string, any>): string {
  const params = new URLSearchParams();

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item: any) => {
          params.append(key, item);
        });
      } else {
        params.append(key, value);
      }
    }
  });

  return params.toString();
}

export const JsonTransformer = {
  to: (value: any) => {
    return value !== undefined ? JSON.stringify(value) : null;
  },
  from: (value: any) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  },
};
