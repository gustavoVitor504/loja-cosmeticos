-- Inserir categorias
INSERT INTO public.categories (name, slug, description) VALUES
  ('Perfumaria', 'perfumaria', 'Perfumes e fragrâncias exclusivas Natura'),
  ('Cuidados com o Corpo', 'corpo', 'Hidratantes, óleos e produtos para cuidados corporais'),
  ('Cuidados com o Rosto', 'rosto', 'Cremes, séruns e produtos para cuidados faciais'),
  ('Maquiagem', 'maquiagem', 'Batons, sombras, bases e toda linha de maquiagem'),
  ('Cabelos', 'cabelos', 'Shampoos, condicionadores e tratamentos capilares'),
  ('Presentes', 'presentes', 'Kits e conjuntos especiais para presentear')
ON CONFLICT (slug) DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO public.products (name, slug, description, price, discount_percent, category_id, stock, is_active, magazine_available, images) VALUES
  ('Essencial Exclusivo Masculino', 'essencial-exclusivo-masculino', 'Uma fragrância sofisticada e marcante para homens modernos. Notas de madeira e especiarias.', 189.90, 15, (SELECT id FROM public.categories WHERE slug = 'perfumaria'), 25, true, true, ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500']),
  ('Kaiak Feminino', 'kaiak-feminino', 'Fragrância fresca e envolvente, perfeita para o dia a dia. Notas florais e aquáticas.', 159.90, 10, (SELECT id FROM public.categories WHERE slug = 'perfumaria'), 30, true, true, ARRAY['https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500']),
  ('Luna Intenso', 'luna-intenso', 'Perfume floral oriental intenso e sedutor. Para mulheres que querem deixar sua marca.', 249.90, 20, (SELECT id FROM public.categories WHERE slug = 'perfumaria'), 15, true, true, ARRAY['https://images.unsplash.com/photo-1595425959106-46de66a2f617?w=500']),
  ('Tododia Cereja e Avelã', 'tododia-cereja-avela', 'Hidratante corporal com fragrância gourmet de cereja e avelã. Pele macia e perfumada.', 49.90, 0, (SELECT id FROM public.categories WHERE slug = 'corpo'), 50, true, false, ARRAY['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500']),
  ('Ekos Castanha', 'ekos-castanha', 'Óleo trifásico nutritivo com ativo da Amazônia. Hidratação profunda para pele e cabelos.', 79.90, 5, (SELECT id FROM public.categories WHERE slug = 'corpo'), 35, true, true, ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500']),
  ('Chronos Antissinais 30+', 'chronos-antissinais-30', 'Creme facial antissinais para peles a partir dos 30 anos. Firmeza e luminosidade.', 149.90, 25, (SELECT id FROM public.categories WHERE slug = 'rosto'), 20, true, true, ARRAY['https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=500']),
  ('Una Batom Matte', 'una-batom-matte', 'Batom matte de longa duração com acabamento aveludado. Cores intensas e vibrantes.', 59.90, 0, (SELECT id FROM public.categories WHERE slug = 'maquiagem'), 60, true, false, ARRAY['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500']),
  ('Lumina Shampoo', 'lumina-shampoo', 'Shampoo para cabelos danificados. Recuperação e brilho intenso.', 39.90, 10, (SELECT id FROM public.categories WHERE slug = 'cabelos'), 45, true, false, ARRAY['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500']),
  ('Kit Presente Ekos', 'kit-presente-ekos', 'Kit especial com produtos da linha Ekos. Perfeito para presentear quem você ama.', 199.90, 15, (SELECT id FROM public.categories WHERE slug = 'presentes'), 10, true, true, ARRAY['https://images.unsplash.com/photo-1549439602-43ebca2327af?w=500']),
  ('Faces Hidratante Facial', 'faces-hidratante-facial', 'Hidratante leve para uso diário. Absorção rápida e sensação de frescor.', 44.90, 0, (SELECT id FROM public.categories WHERE slug = 'rosto'), 40, true, false, ARRAY['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500'])
ON CONFLICT (slug) DO NOTHING;

-- Inserir configurações da consultora
INSERT INTO public.consultant_settings (name, bio, phone, email, instagram, whatsapp, years_experience) VALUES
  ('Maria Silva', 'Olá! Sou consultora Natura há mais de 8 anos, apaixonada por beleza e bem-estar. Minha missão é ajudar você a encontrar os produtos perfeitos para realçar sua beleza natural. Faço entregas em toda a região e ofereço atendimento personalizado para cada cliente.', '(11) 99999-9999', 'maria@consultora.com', '@mariasilva.natura', '5511999999999', 8)
ON CONFLICT DO NOTHING;
