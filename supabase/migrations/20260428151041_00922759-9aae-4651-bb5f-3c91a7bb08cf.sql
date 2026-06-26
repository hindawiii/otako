CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_url TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  reward_points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes viewable by authenticated"
ON public.quizzes FOR SELECT
TO authenticated
USING (true);

CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.quizzes (title, description, difficulty, reward_points, questions_json) VALUES
('تحدي One Piece', 'اختبر معلوماتك في عالم القراصنة', 'medium', 20, '[]'::jsonb),
('أسرار الشينوبي - Naruto', 'هل أنت خبير في عالم النينجا؟', 'hard', 30, '[]'::jsonb),
('عصر التنانين - Dragon Ball', 'تحدي للساياجين الحقيقيين', 'easy', 10, '[]'::jsonb),
('Attack on Titan - الأسرار', 'كل ما تعرفه عن التايتنز', 'hard', 35, '[]'::jsonb);