-- Pink Floyd - The Dark Side of the Moon
-- Sample data seed for development

-- Album metadata
INSERT INTO album_metadata (title, release_date, record_label, producer, recording_location, recording_start_date, recording_end_date, overview_text, sales_figures, chart_positions) VALUES
('The Dark Side of the Moon', '1973-03-01', 'Harvest/Capitol', 'Pink Floyd with Alan Parsons engineering', 'Abbey Road Studios, London', '1972-05-01', '1973-01-01', 
'The Dark Side of the Moon is the eighth studio album by the English rock band Pink Floyd, released on 1 March 1973. Developed during live performances before recording began, it explores themes such as conflict, greed, time, death, and mental illness. The album is built upon experimentation with tape loops, multitrack recording, and analogue synthesizers.', 
'{"worldwide": "45+ million", "billboardWeeks": 900}',
'[{"chart": "Billboard 200", "position": 1, "year": 1973}, {"chart": "UK Albums Chart", "position": 2, "year": 1973}]');

-- Tracks
INSERT INTO tracks (track_number, title, duration, composers, themes, lyrics_excerpt, musical_analysis, cultural_significance, audio_preview_filename, waveform_data) VALUES
(1, 'Speak to Me', '1:30', '["Nick Mason"]', '["madness"]', 
'I''ve been mad for fucking years...', 
'An instrumental collage featuring heartbeat sounds, cash registers, and spoken word samples that introduces the album''s themes.',
'Sets the stage for the album''s exploration of mental health and the pressures of modern life.',
'track-01-speak-to-me-preview.mp3', '[0.1, 0.3, 0.5, 0.2, 0.4, 0.6, 0.3, 0.5]');

INSERT INTO tracks (track_number, title, duration, composers, themes, lyrics_excerpt, musical_analysis, cultural_significance, audio_preview_filename, waveform_data) VALUES
(2, 'Breathe', '2:43', '["David Gilmour", "Richard Wright", "Roger Waters"]', '["time", "life"]', 
'Breathe, breathe in the air...', 
'A gentle acoustic ballad featuring David Gilmour''s slide guitar work and Richard Wright''s atmospheric keyboards.',
'Emphasizes living in the moment and not letting life slip away.',
'track-02-breathe-preview.mp3', '[0.2, 0.4, 0.3, 0.5, 0.4, 0.6, 0.5, 0.4]');

INSERT INTO tracks (track_number, title, duration, composers, themes, lyrics_excerpt, musical_analysis, cultural_significance, audio_preview_filename, waveform_data) VALUES
(3, 'On the Run', '3:30', '["Roger Waters", "David Gilmour"]', '["travel", "anxiety"]', 
'Live for today, gone tomorrow...', 
'An experimental electronic piece using the EMS Synthi AKS synthesizer to create a sense of travel and anxiety.',
'Represents the stress and anxiety of modern travel and life pace.',
'track-03-on-the-run-preview.mp3', '[0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.7]');

INSERT INTO tracks (track_number, title, duration, composers, themes, lyrics_excerpt, musical_analysis, cultural_significance, audio_preview_filename, waveform_data) VALUES
(4, 'Time', '6:53', '["David Gilmour", "Richard Wright", "Roger Waters", "Nick Mason"]', '["time", "life", "death"]', 
'Ticking away the moments that make up a dull day...', 
'Features a distinctive drum fill by Nick Mason, multiple time signature changes, and one of Gilmour''s most celebrated guitar solos.',
'A meditation on the passage of time and the realization that life is shorter than we think.',
'track-04-time-preview.mp3', '[0.4, 0.6, 0.5, 0.7, 0.6, 0.8, 0.7, 0.6]');

INSERT INTO tracks (track_number, title, duration, composers, themes, lyrics_excerpt, musical_analysis, cultural_significance, audio_preview_filename, waveform_data) VALUES
(5, 'The Great Gig in the Sky', '4:36', '["Richard Wright", "Clare Torry"]', '["death", "afterlife"]', 
'And I am not frightened of dying...', 
'Features Clare Torry''s powerful wordless vocals, recorded in a single take, over Richard Wright''s haunting piano chords.',
'Explores mortality and what lies beyond death, without taking a definitive stance.',
'track-05-the-great-gig-in-the-sky-preview.mp3', '[0.5, 0.7, 0.6, 0.8, 0.7, 0.9, 0.8, 0.7]');

INSERT INTO tracks (track_number, title, duration, composers, themes, lyrics_excerpt, musical_analysis, cultural_significance, audio_preview_filename, waveform_data) VALUES
(6, 'Money', '6:22', '["Roger Waters"]', '["money", "greed", "capitalism"]', 
'Money, get away...', 
'Famous for its 7/4 time signature, tape loop of cash registers and coins, and saxophone solo by Dick Parry.',
'A satirical critique of materialism and the corrupting influence of wealth.',
'track-06-money-preview.mp3', '[0.6, 0.8, 0.7, 0.9, 0.8, 1.0, 0.9, 0.8]');

INSERT INTO tracks (track_number, title, duration, composers, themes, lyrics_excerpt, musical_analysis, cultural_significance, audio_preview_filename, waveform_data) VALUES
(7, 'Us and Them', '7:49', '["Richard Wright", "Roger Waters"]', '["conflict", "war", "division"]', 
'Us and them, and after all we''re only ordinary men...', 
'A haunting ballad featuring Richard Wright''s piano and another saxophone performance by Dick Parry.',
'Addresses human conflict, war, and the arbitrary divisions between people.',
'track-07-us-and-them-preview.mp3', '[0.5, 0.7, 0.6, 0.8, 0.7, 0.9, 0.8, 0.7]');

INSERT INTO tracks (track_number, title, duration, composers, themes, lyrics_excerpt, musical_analysis, cultural_significance, audio_preview_filename, waveform_data) VALUES
(8, 'Any Colour You Like', '3:24', '["David Gilmour", "Richard Wright", "Nick Mason"]', '["choice", "illusion"]', 
'(Instrumental)', 
'An instrumental jam showcasing the band''s musical interplay and synthesizer experimentation.',
'Represents the illusion of choice in a consumer-driven society.',
'track-08-any-colour-you-like-preview.mp3', '[0.4, 0.6, 0.5, 0.7, 0.6, 0.8, 0.7, 0.6]');

INSERT INTO tracks (track_number, title, duration, composers, themes, lyrics_excerpt, musical_analysis, cultural_significance, audio_preview_filename, waveform_data) VALUES
(9, 'Brain Damage', '3:46', '["Roger Waters"]', '["madness", "mental-health"]', 
'The lunatic is on the grass...', 
'Roger Waters'' vocals and lyrics about mental illness, building to the album''s climax.',
'Deals with themes of mental illness and societal attitudes toward those who are different.',
'track-09-brain-damage-preview.mp3', '[0.5, 0.7, 0.6, 0.8, 0.7, 0.9, 0.8, 0.7]');

INSERT INTO tracks (track_number, title, duration, composers, themes, lyrics_excerpt, musical_analysis, cultural_significance, audio_preview_filename, waveform_data) VALUES
(10, 'Eclipse', '2:03', '["Roger Waters"]', '["life", "death", "unity"]', 
'All that you touch, all that you see...', 
'The album''s grand finale featuring layered vocals and a powerful conclusion.',
'A summary of human existence and experience, bringing together all the album''s themes.',
'track-10-eclipse-preview.mp3', '[0.6, 0.8, 0.7, 0.9, 0.8, 1.0, 0.9, 0.8]');

-- Themes
INSERT INTO themes (slug, name, description, icon, color_accent, display_order) VALUES
('time', 'Time', 
'Time explores humanity''s relationship with the passage of time, the anxiety of aging, and the realization that life is shorter than we imagine. The tracks "Time" and "Breathe" address how we spend our days and the danger of letting life slip away while we focus on trivial matters.',
'clock', '#FF6B6B', 1);

INSERT INTO themes (slug, name, description, icon, color_accent, display_order) VALUES
('death', 'Death & Mortality', 
'Death is an ever-present theme throughout the album, from the heartbeat that opens and closes the record to Clare Torry''s ethereal vocals on "The Great Gig in the Sky." Rather than fearing death, the album suggests accepting mortality as a natural part of existence.',
'skull', '#4ECDC4', 2);

INSERT INTO themes (slug, name, description, icon, color_accent, display_order) VALUES
('money', 'Money & Greed', 
'Money and materialism are satirized in one of the album''s most famous tracks. The song critiques how the pursuit of wealth corrupts human values and creates inequality. The cash register sounds that open the track emphasize the omnipresence of money in modern life.',
'dollar-sign', '#45B7D1', 3);

INSERT INTO themes (slug, name, description, icon, color_accent, display_order) VALUES
('mental-health', 'Mental Health', 
'Mental illness and societal attitudes toward those who struggle with it are central themes. The album humanizes those labeled as "mad" or "lunatics," questioning who truly has the right to define sanity. "Brain Damage" draws from Roger Waters'' personal experiences.',
'brain', '#96CEB4', 4);

INSERT INTO themes (slug, name, description, icon, color_accent, display_order) VALUES
('conflict', 'Conflict & War', 
'War and human conflict are addressed in "Us and Them," which questions why humanity is divided into opposing sides. The song suggests that these divisions are often arbitrary and that recognizing our shared humanity is the path to peace.',
'peace', '#FFEAA7', 5);

-- Artwork
INSERT INTO artwork (title, category, image_filename, thumbnail_filename, designer, description, year, copyright_notice, is_primary, display_order) VALUES
('Prism Album Cover', 'cover', 'prism-cover.webp', 'prism-cover-thumb.webp', 'Storm Thorgerson / Hipgnosis', 'The iconic album cover featuring a prism dispersing white light into a rainbow spectrum against a black background, representing the album''s themes of light, darkness, and transformation.', 1973, '© 1973 Pink Floyd Music Ltd. Design by Hipgnosis.', 1, 1);

INSERT INTO artwork (title, category, image_filename, thumbnail_filename, designer, description, year, copyright_notice, is_primary, display_order) VALUES
('Back Cover', 'cover', 'back-cover.webp', 'back-cover-thumb.webp', 'Storm Thorgerson / Hipgnosis', 'The back cover features the reverse image: a rainbow converging into a prism, symbolizing unity and completion.', 1973, '© 1973 Pink Floyd Music Ltd. Design by Hipgnosis.', 0, 2);

INSERT INTO artwork (title, category, image_filename, thumbnail_filename, designer, description, year, copyright_notice, is_primary, display_order) VALUES
('Abbey Road Studios Session', 'behind-scenes', 'abbey-road-session.webp', 'abbey-road-session-thumb.webp', 'Jill Furmanovsky', 'The band recording at Abbey Road Studios in 1972, capturing the creative process behind the album.', 1972, '© 1972 Pink Floyd Music Ltd. Photo by Jill Furmanovsky.', 0, 3);

-- Equipment
INSERT INTO equipment (name, type, manufacturer, model, specifications, image_filename, usage_description, associated_tracks, display_order) VALUES
('EMS Synthi AKS', 'synthesizer', 'EMS', 'Synthi AKS', 'Portable synthesizer with pin matrix patching, three oscillators, filter, and envelope generator', 'ems-synthi.webp', 'Used extensively on "On the Run" to create the driving synthesizer sequence and sound effects. Roger Waters created the main sequence on this portable synth.', '["On the Run", "Any Colour You Like"]', 1);

INSERT INTO equipment (name, type, manufacturer, model, specifications, image_filename, usage_description, associated_tracks, display_order) VALUES
('Neumann U87 Microphone', 'microphone', 'Neumann', 'U87', 'Large diaphragm condenser microphone with three polar patterns', 'neumann-u87.webp', 'Used for recording vocals throughout the album, particularly on "The Great Gig in the Sky" for Clare Torry''s voice.', '["The Great Gig in the Sky", "Brain Damage", "Eclipse"]', 2);

INSERT INTO equipment (name, type, manufacturer, model, specifications, image_filename, usage_description, associated_tracks, display_order) VALUES
('Abbey Road EMI TG12345 Console', 'mixer', 'EMI', 'TG12345 Mk IV', '16-track mixing console with transistor-based design', 'emi-console.webp', 'The main recording console used at Abbey Road Studios during the sessions, providing the distinctive sound of the album.', '["All Tracks"]', 3);
