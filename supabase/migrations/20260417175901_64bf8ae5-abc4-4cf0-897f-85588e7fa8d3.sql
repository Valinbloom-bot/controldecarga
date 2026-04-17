CREATE TABLE public.gastos_vehiculo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fecha TEXT,
  categoria TEXT,
  descripcion TEXT,
  monto NUMERIC NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gastos_vehiculo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own gastos_vehiculo" ON public.gastos_vehiculo FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own gastos_vehiculo" ON public.gastos_vehiculo FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own gastos_vehiculo" ON public.gastos_vehiculo FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own gastos_vehiculo" ON public.gastos_vehiculo FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_gastos_vehiculo_updated_at
BEFORE UPDATE ON public.gastos_vehiculo
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();