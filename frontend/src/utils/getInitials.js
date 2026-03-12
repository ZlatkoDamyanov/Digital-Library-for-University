export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
  }
  
  export function getInitials(firstName, lastName) {
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0) : '';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  }
  