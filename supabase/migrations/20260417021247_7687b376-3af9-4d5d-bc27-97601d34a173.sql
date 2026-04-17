
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Updated-at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Cargas
CREATE TABLE public.cargas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_recogida TEXT,
  hora_recogida TEXT,
  ubicacion_recogida TEXT,
  fecha_entrega TEXT,
  hora_entrega TEXT,
  ubicacion_entrega TEXT,
  millas_vacias NUMERIC NOT NULL DEFAULT 0,
  millas_cargadas NUMERIC NOT NULL DEFAULT 0,
  pago_recibido NUMERIC NOT NULL DEFAULT 0,
  costo_gasolina NUMERIC NOT NULL DEFAULT 0,
  gastos_comida NUMERIC NOT NULL DEFAULT 0,
  hospedaje NUMERIC NOT NULL DEFAULT 0,
  otros_gastos NUMERIC NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cargas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select own cargas" ON public.cargas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own cargas" ON public.cargas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own cargas" ON public.cargas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own cargas" ON public.cargas FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_cargas_updated_at BEFORE UPDATE ON public.cargas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cargas_user ON public.cargas(user_id);

-- Gasolina
CREATE TABLE public.gasolina (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  carga_id UUID REFERENCES public.cargas(id) ON DELETE SET NULL,
  fecha TEXT,
  gasolinera TEXT,
  ubicacion TEXT,
  galones NUMERIC NOT NULL DEFAULT 0,
  precio_por_galon NUMERIC NOT NULL DEFAULT 0,
  snack_comida NUMERIC NOT NULL DEFAULT 0,
  metodo_pago TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gasolina ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select own gasolina" ON public.gasolina FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own gasolina" ON public.gasolina FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own gasolina" ON public.gasolina FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own gasolina" ON public.gasolina FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_gasolina_updated_at BEFORE UPDATE ON public.gasolina FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_gasolina_user ON public.gasolina(user_id);
CREATE INDEX idx_gasolina_carga ON public.gasolina(carga_id);

-- Peajes
CREATE TABLE public.peajes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha TEXT,
  ubicacion_carretera TEXT,
  monto NUMERIC NOT NULL DEFAULT 0,
  metodo_pago TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.peajes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select own peajes" ON public.peajes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own peajes" ON public.peajes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own peajes" ON public.peajes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own peajes" ON public.peajes FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_peajes_updated_at BEFORE UPDATE ON public.peajes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_peajes_user ON public.peajes(user_id);

-- Metas
CREATE TABLE public.metas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mes TEXT NOT NULL,
  meta_cargas NUMERIC NOT NULL DEFAULT 0,
  meta_ingreso NUMERIC NOT NULL DEFAULT 0,
  meta_millas NUMERIC NOT NULL DEFAULT 0,
  meta_ganancia_neta NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mes)
);
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select own metas" ON public.metas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own metas" ON public.metas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own metas" ON public.metas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own metas" ON public.metas FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON public.metas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_metas_user ON public.metas(user_id);
