-- Insert sample users (password: 'password123' hashed with bcrypt)
INSERT INTO users (username, email, password_hash, avatar_url) VALUES
('alice', 'alice@foodie.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3jHyCYwJ8nKxG', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'),
('bob', 'bob@foodie.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3jHyCYwJ8nKxG', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'),
('charlie', 'charlie@foodie.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3jHyCYwJ8nKxG', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'),
('diana', 'diana@foodie.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3jHyCYwJ8nKxG', 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana'),
('eve', 'eve@foodie.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3jHyCYwJ8nKxG', 'https://api.dicebear.com/7.x/avataaars/svg?seed=eve');

-- Insert sample posts with locations around HKU area (roughly 22.283, 114.137)
INSERT INTO posts (user_id, image_url, description, restaurant_name, location) VALUES
(1, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'Best pizza in town! The crust is perfectly crispy.', 'Pizza Express', ST_SetSRID(ST_MakePoint(114.137, 22.283), 4326)),
(2, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800', 'Amazing pancakes with fresh berries.', 'The Pantry', ST_SetSRID(ST_MakePoint(114.141, 22.285), 4326)),
(3, 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800', 'Sushi platter was incredible. Fresh and flavorful.', 'Sushi Zen', ST_SetSRID(ST_MakePoint(114.135, 22.281), 4326)),
(1, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 'BBQ ribs fell off the bone. Highly recommend!', 'Smokehouse BBQ', ST_SetSRID(ST_MakePoint(114.139, 22.287), 4326)),
(4, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', 'Healthy salad bowl with avocado and quinoa.', 'Green Garden', ST_SetSRID(ST_MakePoint(114.133, 22.279), 4326)),
(2, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', 'Ramen with rich tonkotsu broth. So comforting.', 'Ramen House', ST_SetSRID(ST_MakePoint(114.140, 22.284), 4326)),
(5, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 'Juicy burger with truffle fries. Must try!', 'Burger Joint', ST_SetSRID(ST_MakePoint(114.136, 22.286), 4326)),
(3, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800', 'Authentic Italian pasta. The carbonara is divine.', 'Pasta Fresca', ST_SetSRID(ST_MakePoint(114.142, 22.280), 4326)),
(1, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', 'Neapolitan pizza cooked in wood-fired oven.', 'Napoli Pizza', ST_SetSRID(ST_MakePoint(114.138, 22.282), 4326)),
(4, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', 'Buddha bowl with all the good stuff.', 'Wellness Cafe', ST_SetSRID(ST_MakePoint(114.134, 22.288), 4326));

-- Insert likes (distributed to create realistic like counts)
INSERT INTO likes (user_id, post_id) VALUES
(2, 1), (3, 1), (4, 1), (5, 1),
(1, 2), (3, 2), (4, 2),
(1, 3), (2, 3), (5, 3),
(3, 4), (4, 4), (5, 4), (1, 4),
(2, 5), (3, 5),
(1, 6), (4, 6), (5, 6),
(2, 7), (3, 7), (4, 7), (5, 7), (1, 7),
(1, 8), (2, 8),
(2, 9), (3, 9), (4, 9),
(1, 10), (2, 10), (3, 10);

-- Insert marks
INSERT INTO marks (user_id, post_id) VALUES
(1, 2), (1, 3), (1, 6),
(2, 1), (2, 5), (2, 7),
(3, 4), (3, 8), (3, 9),
(4, 1), (4, 3), (4, 6), (4, 10),
(5, 2), (5, 5), (5, 7);

-- Insert comments
INSERT INTO comments (post_id, user_id, content, is_tasted) VALUES
(1, 2, 'I went there last week and agree! The margherita is amazing.', TRUE),
(1, 3, 'Adding this to my must-try list.', FALSE),
(2, 1, 'The berry compote is homemade. You can taste the freshness.', TRUE),
(3, 4, 'Sushi Zen never disappoints. Try the omakase.', TRUE),
(4, 5, 'Portion size is huge. Great for sharing.', FALSE),
(5, 2, 'Perfect for a light lunch after class.', TRUE),
(6, 1, 'The chashu is so tender. Best ramen in the area.', TRUE),
(7, 3, 'Truffle fries are addictive!', TRUE),
(8, 5, 'Carbonara with guanciale - authentic!', TRUE),
(9, 2, 'Wood-fired taste is unbeatable.', FALSE),
(10, 3, 'Healthy but filling. Love the tahini dressing.', TRUE);

-- Insert comment likes
INSERT INTO comment_likes (comment_id, user_id) VALUES
(1, 1), (1, 3), (1, 4),
(2, 1), (2, 2),
(3, 1), (3, 2), (3, 5),
(4, 1), (4, 3),
(5, 2), (5, 4),
(6, 1), (6, 3), (6, 5),
(7, 2), (7, 4),
(8, 3), (8, 5),
(9, 1), (9, 2),
(10, 3), (10, 4), (10, 5);
