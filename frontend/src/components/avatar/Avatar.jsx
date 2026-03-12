import React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import "./Avatar.css";

const Avatar = React.forwardRef(({ className = "", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={`avatar-root ${className}`}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className = "", ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={`avatar-image ${className}`}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={`avatar-fallback ${className}`}
    {...props}
  >
    {children}
  </AvatarPrimitive.Fallback>
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };