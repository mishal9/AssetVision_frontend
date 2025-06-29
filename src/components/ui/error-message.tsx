import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../utils/cn';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'default' | 'destructive';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  onDismiss?: () => void;
}

/**
 * ErrorMessage component for displaying error messages with optional actions
 * 
 * @param title - Optional title for the error
 * @param message - The error message to display
 * @param variant - The variant of the error message (default or destructive)
 * @param action - Optional action button configuration
 * @param className - Additional CSS classes
 * @param onDismiss - Optional callback function when error is dismissed
 */
export function ErrorMessage({
  title = 'Error',
  message,
  variant = 'default',
  action,
  className,
  onDismiss,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'rounded-md p-4 mb-4 flex items-start',
        variant === 'destructive' ? 'bg-destructive/15 text-destructive' : 'bg-muted',
        className
      )}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {variant === 'destructive' ? (
          <XCircle className="h-5 w-5 text-destructive" />
        ) : (
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1">
        {title && <h4 className="text-sm font-medium">{title}</h4>}
        <div className="text-sm">{message}</div>
        {action && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className={variant === 'destructive' ? 'border-destructive/30 hover:bg-destructive/10' : ''}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          className="flex-shrink-0 ml-3 h-5 w-5 text-muted-foreground hover:text-foreground"
        >
          <XCircle className="h-5 w-5" />
          <span className="sr-only">Dismiss</span>
        </button>
      )}
    </div>
  );
}
