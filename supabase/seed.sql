-- Initial CV content, taken from the LinkedIn profile (October 2026).
-- Run once after the migration. Later changes go through admin.html.

insert into public.profile (
  id, full_name, avatar_initials, linkedin_url,
  location_ro, location_en,
  current_job_title_ro, current_job_title_en, current_company,
  about_ro, about_en
) values (
  1,
  'Andrei Croitoru',
  'AC',
  'https://www.linkedin.com/in/andrei-croitoru-04aa43162',
  'București, România',
  'Bucharest, Romania',
  'Low Code Engineer',
  'Low Code Engineer',
  'Plant an App',
  'Sociabil și atent la detalii, cu talent pentru a consolida relații profesionale. Concentrat pe livrarea celor mai bune rezultate și motivat să învăț lucruri noi și să-mi dezvolt în continuare pregătirea tehnică și analitică.',
  'Outgoing and detail-oriented, proficient at consolidating professional relationships. Focused on delivering the best possible results and deeply motivated to learn new skills and further improve my technical and analytical background.'
);

insert into public.work_experience
  (job_title_ro, job_title_en, company_name, location_ro, location_en, start_date, end_date, logo_initials, logo_color, sort_order)
values
  ('Low Code Engineer', 'Low Code Engineer', 'Plant an App', 'București, România', 'Bucharest, Romania', '2018-06-01', null, 'PA', '#2f9e5b', 1),
  ('Web Application Developer', 'Web Application Developer', 'DNN Sharp', null, null, '2018-06-01', null, 'DS', '#0a66c2', 2);

insert into public.education
  (school_name_ro, school_name_en, degree_name_ro, degree_name_en, start_year, end_year, logo_initials, logo_color, sort_order)
values
  ('Universitatea POLITEHNICA din București', 'University POLITEHNICA of Bucharest',
   'Licență în Informatică', 'Bachelor''s Degree, Computer Science', 2014, 2019, 'UPB', '#8e1b2c', 1);

insert into public.certifications
  (certificate_name, skill_level, issued_by, issue_date, sort_order)
values
  ('SQL', 3, 'HackerRank', '2024-08-01', 1),
  ('SQL', 2, 'HackerRank', '2024-08-01', 2),
  ('SQL', 1, 'HackerRank', '2024-08-01', 3),
  ('CSS', 1, 'HackerRank', '2024-08-01', 4);

insert into public.skills (name_ro, name_en, sort_order) values
  ('Platforme low-code', 'Low-code platforms', 1),
  ('Plant an App', 'Plant an App', 2),
  ('DNN Sharp', 'DNN Sharp', 3),
  ('Aplicații web', 'Web applications', 4),
  ('SQL', 'SQL', 5),
  ('CSS', 'CSS', 6),
  ('Analiză tehnică', 'Technical analysis', 7);
