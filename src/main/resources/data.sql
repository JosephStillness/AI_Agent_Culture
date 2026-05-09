INSERT INTO knowledge_base (id, title, content, category, created_at)
VALUES
    (
        1,
        'Cross-cultural group work',
        'At MQ, students may come from different communication cultures. In group work, direct feedback can sometimes feel too personal, while indirect feedback can feel unclear. A helpful approach is to explain your intention, ask for the other person''s perspective, and agree on how the group wants to communicate. This reduces misunderstanding and supports respectful collaboration.',
        'culture',
        CURRENT_TIMESTAMP
    ),
    (
        2,
        'Belonging and making connections',
        'New students at MQ can feel isolated when they do not yet understand local social norms or how to join conversations. Low-pressure activities such as peer circles, cultural sharing events, student clubs, study groups, and language exchange can help students build confidence and belonging through repeated friendly contact.',
        'culture',
        CURRENT_TIMESTAMP
    ),
    (
        3,
        'Responsible culture chatbot behaviour',
        'A culture chatbot for MQ should avoid stereotypes and should not present one culture as normal or superior. It should give context-based suggestions, acknowledge that cultural meaning can vary, avoid making unsupported claims, protect student privacy, and encourage students to seek human support for sensitive or harmful situations.',
        'culture',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('knowledge_base', 'id'),
    (SELECT COALESCE(MAX(id), 1) FROM knowledge_base)
);
