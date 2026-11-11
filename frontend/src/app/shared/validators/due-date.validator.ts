
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

export function dueDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Required is handled separately
    if (!value) return null;

    // Expect the HTML date format: YYYY-MM-DD
    if (
      typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      return { invalidDate: true };
    }

    const selectedDate = new Date(`${value}T00:00:00`);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.getFullYear() !== Number(value.slice(0, 4)) ||
      selectedDate.getMonth() + 1 !== Number(value.slice(5, 7)) ||
      selectedDate.getDate() !== Number(value.slice(8, 10))
    ) {
      return { invalidDate: true };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 2);

    if (selectedDate < today) {
      return { pastDate: true };
    }

    if (selectedDate > maxDate) {
      return { tooFar: true };
    }

    return null;
  };
}
