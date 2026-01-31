-- Create a function to notify feedback author on status changes
CREATE OR REPLACE FUNCTION public.notify_feedback_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  status_message text;
BEGIN
  -- Only trigger on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Build the status message
    CASE NEW.status
      WHEN 'in_review' THEN
        status_message := 'Your feedback is now being reviewed by our team.';
      WHEN 'planned' THEN
        status_message := 'Great news! Your feedback has been planned for implementation.';
      WHEN 'in_progress' THEN
        status_message := 'Your feedback is now being worked on!';
      WHEN 'resolved' THEN
        status_message := 'Your feedback has been resolved. Thank you for your contribution!';
      WHEN 'closed' THEN
        status_message := 'Your feedback has been closed.';
      ELSE
        status_message := 'Your feedback status has been updated to: ' || NEW.status;
    END CASE;

    -- Insert notification for the feedback author
    INSERT INTO public.notifications (
      user_id,
      organization_id,
      type,
      title,
      message,
      link
    ) VALUES (
      NEW.user_id,
      NEW.organization_id,
      'feedback',
      'Feedback Update: ' || LEFT(NEW.title, 50),
      status_message,
      '/feedback?id=' || NEW.id::text
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_feedback_status_change ON public.feedback;
CREATE TRIGGER on_feedback_status_change
  AFTER UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_feedback_status_change();