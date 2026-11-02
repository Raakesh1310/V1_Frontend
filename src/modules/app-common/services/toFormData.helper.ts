/**
 * This Function basically Iterate through
 * the given FormValue Object
 * and append the sub values in an FormData Object
 * by checking the type of value
 */
export function toFormData<T>(formValue: T) {
  const formData = new FormData();

  for (const key of Object.keys(formValue)) {
    // @ts-ignore
    const value = formValue[key];

    if (!value) {
      continue;
    }

    if (typeof value === 'string') {
      formData.append(key, value);
    } else if (typeof value === 'object') {
      for (const objKey of Object.keys(value)) {
        if (parseInt(objKey, 10) >= 0) {
          formData.append(key, value.item(objKey));
        }
      }
    }
  }

  return formData;
}
