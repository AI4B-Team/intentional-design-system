-- Enable realtime for the tables we want to subscribe to
ALTER PUBLICATION supabase_realtime ADD TABLE public.inbox_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dispo_deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;