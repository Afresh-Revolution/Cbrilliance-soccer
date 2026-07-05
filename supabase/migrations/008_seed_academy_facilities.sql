-- 008: Seed default academy facilities with stable UUIDs (for admin edit/delete)

INSERT INTO academy_facilities (id, name, image_url, sort_order)
SELECT * FROM (VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Training Ground', 'cbfc/players/tata-action.png', 0),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Gym', 'cbfc/players/tata-action2.png', 1),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'Classrooms', 'cbfc/players/chocho-action.png', 2),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'Medical Support', 'cbfc/players/chocho-back.png', 3),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'Recovery Area', 'cbfc/players/tata-action.png', 4)
) AS seed(id, name, image_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM academy_facilities LIMIT 1);
