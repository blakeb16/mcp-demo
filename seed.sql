-- Seed data with 60 places across major US cities

INSERT INTO places (name, category, latitude, longitude, rating, price_level, description, amenities, hours, address, phone, website) VALUES

-- San Francisco Cafes
('Blue Bottle Coffee', 'cafe', 37.7749, -122.4194, 4.5, 2, 'Artisan coffee roaster', '["wifi", "outdoor_seating"]', 'Mon-Sun 7am-6pm', '66 Mint St, San Francisco, CA', '415-555-0101', NULL),
('Philz Coffee', 'cafe', 37.7849, -122.4094, 4.8, 2, 'Customized coffee blends', '["wifi", "outdoor_seating"]', 'Mon-Sun 6am-8pm', '3101 24th St, San Francisco, CA', '415-555-0106', NULL),
('Sightglass Coffee', 'cafe', 37.7699, -122.4169, 4.6, 2, 'SF roastery and cafe', '["wifi", "outdoor_seating"]', 'Mon-Sun 7am-7pm', '270 7th St, San Francisco, CA', '415-555-0111', NULL),

-- Portland Cafes
('Stumptown Coffee', 'cafe', 45.5231, -122.6765, 4.7, 2, 'Portland coffee institution', '["wifi", "outdoor_seating", "parking"]', 'Mon-Sun 6am-8pm', '128 SW 3rd Ave, Portland, OR', '503-555-0102', NULL),
('Coava Coffee', 'cafe', 45.5152, -122.6551, 4.7, 2, 'Portland specialty roaster', '["wifi", "outdoor_seating"]', 'Mon-Sun 7am-6pm', '1300 SE Grand Ave, Portland, OR', '503-555-0109', NULL),

-- NYC Cafes
('Joe Coffee', 'cafe', 40.7410, -73.9896, 4.5, 2, 'NYC neighborhood coffee shop', '["wifi", "outdoor_seating"]', 'Mon-Fri 6:30am-8pm, Sat-Sun 7am-8pm', '141 Waverly Pl, New York, NY', '212-555-0107', NULL),
('Blue Stone Lane', 'cafe', 40.7282, -74.0776, 4.3, 2, 'Australian-style coffee', '["wifi", "outdoor_seating"]', 'Mon-Sun 7am-7pm', '30 Broad St, New York, NY', '212-555-0115', NULL),

-- Chicago Cafes
('Intelligentsia', 'cafe', 41.9028, -87.6317, 4.6, 2, 'Chicago specialty coffee', '["wifi", "outdoor_seating"]', 'Mon-Fri 6:30am-7pm', '53 W Jackson Blvd, Chicago, IL', '312-555-0103', NULL),
('Little Goat Coffee', 'cafe', 41.8781, -87.6298, 4.4, 2, 'Chicago neighborhood cafe', '["wifi", "outdoor_seating"]', 'Mon-Sun 7am-5pm', '820 W Randolph St, Chicago, IL', '312-555-0120', NULL),

-- LA Cafes
('Go Get Em Tiger', 'cafe', 34.0736, -118.3628, 4.7, 2, 'LA specialty coffee', '["wifi", "outdoor_seating", "parking"]', 'Mon-Sun 6:30am-6pm', '230 N Larchmont Blvd, Los Angeles, CA', '323-555-0114', NULL),

-- San Francisco Restaurants
('Tartine Bakery', 'restaurant', 37.7615, -122.4221, 4.8, 2, 'Iconic SF bakery', '["outdoor_seating"]', 'Mon-Sun 8am-7pm', '600 Guerrero St, San Francisco, CA', '415-555-0201', NULL),
('The Slanted Door', 'restaurant', 37.7956, -122.3933, 4.5, 3, 'SF modern Vietnamese', '["outdoor_seating"]', 'Mon-Sun 11am-10pm', 'Ferry Building, San Francisco, CA', '415-555-0210', NULL),

-- NYC Restaurants
('Joe''s Pizza', 'restaurant', 40.7308, -74.0023, 4.4, 1, 'Classic NYC pizza slice', '[]', 'Mon-Sun 10am-4am', '7 Carmine St, New York, NY', '212-555-0219', NULL),
('Katz Delicatessen', 'restaurant', 40.7223, -73.9873, 4.5, 2, 'Historic NYC deli since 1888', '[]', 'Mon-Sun 8am-10:45pm', '205 E Houston St, New York, NY', '212-555-0204', NULL),
('Shake Shack', 'restaurant', 40.7414, -73.9882, 4.3, 2, 'NYC burger chain', '["outdoor_seating"]', 'Mon-Sun 11am-11pm', 'Madison Square Park, New York, NY', '212-555-0212', NULL),
('Los Tacos No. 1', 'restaurant', 40.7424, -74.0060, 4.6, 1, 'NYC authentic Mexican tacos', '[]', 'Mon-Sun 10am-10pm', '75 9th Ave, New York, NY', '212-555-0216', NULL),

-- Chicago Restaurants
('Au Cheval', 'restaurant', 41.8819, -87.6472, 4.7, 2, 'Chicago diner famous for burgers', '["parking"]', 'Mon-Sun 11am-11pm', '800 W Randolph St, Chicago, IL', '312-555-0203', NULL),

-- Portland Restaurants
('Pok Pok', 'restaurant', 45.5081, -122.6090, 4.6, 2, 'Thai street food', '["outdoor_seating", "parking"]', 'Wed-Sun 11:30am-10pm', '3226 SE Division St, Portland, OR', '503-555-0202', NULL),
('Voodoo Doughnut', 'restaurant', 45.5229, -122.6730, 4.2, 1, 'Portland quirky donut shop', '[]', 'Mon-Sun 24 hours', '22 SW 3rd Ave, Portland, OR', '503-555-0214', NULL),

-- Austin Restaurants
('Franklin Barbecue', 'restaurant', 30.2672, -97.7431, 4.8, 2, 'Austin BBQ with legendary brisket', '["outdoor_seating", "parking"]', 'Tue-Sun 11am-3pm', '900 E 11th St, Austin, TX', '512-555-0208', NULL),

-- LA Restaurants
('In-N-Out Burger', 'restaurant', 34.0195, -118.4912, 4.6, 1, 'California burger chain', '["parking"]', 'Mon-Sun 10:30am-1am', '9149 W Sunset Blvd, Los Angeles, CA', '310-555-0205', NULL),

-- NYC Parks (Multiple!)
('Central Park', 'park', 40.7829, -73.9654, 4.9, 0, 'NYC iconic urban park', '["playground", "trails", "lake"]', 'Open 24 hours', 'New York, NY', NULL, NULL),
('Prospect Park Brooklyn', 'park', 40.6602, -73.9690, 4.7, 0, 'Brooklyn designed by Olmsted', '["playground", "trails", "lake"]', 'Open 24 hours', 'Brooklyn, NY', NULL, NULL),
('Washington Square Park', 'park', 40.7308, -73.9973, 4.4, 0, 'NYC Greenwich Village park', '["playground", "outdoor_seating"]', 'Open 6am-12am', 'Washington Square, New York, NY', NULL, NULL),
('Bryant Park', 'park', 40.7536, -73.9832, 4.6, 0, 'Midtown Manhattan park', '["outdoor_seating", "wifi"]', 'Open 7am-10pm', 'New York, NY', NULL, NULL),
('Battery Park', 'park', 40.7033, -74.0170, 4.5, 0, 'Lower Manhattan waterfront park', '["trails", "outdoor_seating"]', 'Open 24 hours', 'New York, NY', NULL, NULL),
('Riverside Park', 'park', 40.7957, -73.9777, 4.6, 0, 'NYC Upper West Side park', '["trails", "playground"]', 'Open 6am-1am', 'New York, NY', NULL, NULL),

-- SF Parks
('Golden Gate Park', 'park', 37.7694, -122.4862, 4.8, 0, 'SF urban park with gardens', '["parking", "playground", "trails"]', 'Open 24 hours', '501 Stanyan St, San Francisco, CA', NULL, NULL),
('Dolores Park', 'park', 37.7596, -122.4269, 4.7, 0, 'SF Mission District park', '["playground", "outdoor_seating"]', 'Open 6am-10pm', '19th St & Dolores St, San Francisco, CA', NULL, NULL),

-- Chicago Parks
('Millennium Park', 'park', 41.8826, -87.6226, 4.6, 0, 'Chicago downtown park with Cloud Gate', '["outdoor_seating"]', 'Open 6am-11pm', '201 E Randolph St, Chicago, IL', NULL, NULL),
('Lincoln Park', 'park', 41.9212, -87.6340, 4.7, 0, 'Chicago lakefront park', '["parking", "playground", "trails"]', 'Open 6am-11pm', '2045 N Lincoln Park W, Chicago, IL', NULL, NULL),

-- LA Parks
('Griffith Park', 'park', 34.1365, -118.2942, 4.5, 0, 'LA urban wilderness with observatory', '["parking", "trails", "playground"]', 'Open 5am-10:30pm', '4730 Crystal Springs Dr, Los Angeles, CA', NULL, NULL),

-- Portland Parks
('Forest Park', 'park', 45.5421, -122.7658, 4.7, 0, 'Portland wilderness park', '["parking", "trails", "playground"]', 'Open 5am-10pm', 'NW 29th Ave, Portland, OR', NULL, NULL),

-- Seattle Parks
('Discovery Park', 'park', 47.6587, -122.4156, 4.6, 0, 'Seattle waterfront park', '["parking", "trails", "beach"]', 'Open 4am-11:30pm', '3801 Discovery Park Blvd, Seattle, WA', NULL, NULL),
('Volunteer Park', 'park', 47.6302, -122.3149, 4.6, 0, 'Seattle Capitol Hill park', '["parking", "playground"]', 'Open 6am-10pm', '1247 15th Ave E, Seattle, WA', NULL, NULL),

-- Austin Park
('Zilker Park', 'park', 30.2672, -97.7731, 4.6, 0, 'Austin park with natural spring pool', '["parking", "playground", "trails"]', 'Open 5am-10pm', '2100 Barton Springs Rd, Austin, TX', NULL, NULL),

-- San Diego Park
('Balboa Park', 'park', 32.7341, -117.1443, 4.8, 0, 'San Diego cultural park', '["parking", "playground"]', 'Open 24 hours', '1549 El Prado, San Diego, CA', NULL, NULL),

-- Bookstores
('Strand Bookstore', 'bookstore', 40.7334, -73.9911, 4.7, 2, 'NYC 18 miles of books', '["wifi"]', 'Mon-Sun 9:30am-10:30pm', '828 Broadway, New York, NY', '212-555-0302', NULL),
('Powell''s City of Books', 'bookstore', 45.5230, -122.6814, 4.8, 2, 'Portland independent bookstore', '["wifi", "cafe"]', 'Mon-Sun 9am-9pm', '1005 W Burnside St, Portland, OR', '503-555-0301', NULL),
('City Lights', 'bookstore', 37.7977, -122.4073, 4.7, 2, 'SF Beat Generation landmark', '["wifi"]', 'Mon-Sun 10am-midnight', '261 Columbus Ave, San Francisco, CA', '415-555-0304', NULL),
('The Last Bookstore', 'bookstore', 34.0478, -118.2493, 4.6, 2, 'LA artistic bookstore in old bank', '["wifi"]', 'Mon-Sun 10am-9pm', '453 S Spring St, Los Angeles, CA', '213-555-0303', NULL),
('Elliott Bay Book Company', 'bookstore', 47.6131, -122.3419, 4.6, 2, 'Seattle indie bookstore', '["wifi", "cafe"]', 'Mon-Sun 10am-9pm', '1521 10th Ave, Seattle, WA', '206-555-0305', NULL),
('BookPeople', 'bookstore', 30.2672, -97.7560, 4.5, 2, 'Austin independent bookstore', '["wifi", "cafe", "parking"]', 'Mon-Sun 9am-9pm', '603 N Lamar Blvd, Austin, TX', '512-555-0306', NULL),

-- Gyms
('Equinox SF', 'gym', 37.7897, -122.4011, 4.3, 3, 'Luxury fitness club', '["parking", "locker_rooms", "pool"]', 'Mon-Fri 5am-11pm', '2 Embarcadero Center, San Francisco, CA', '415-555-0401', NULL),
('SoulCycle NYC', 'gym', 40.7282, -74.0776, 4.4, 3, 'NYC spin class studio', '["locker_rooms"]', 'Mon-Fri 6am-9pm', '103 Warren St, New York, NY', '212-555-0408', NULL),
('CrossFit SoMa', 'gym', 37.7749, -122.4194, 4.6, 2, 'SF CrossFit box', '["locker_rooms"]', 'Mon-Fri 6am-8pm', '333 9th St, San Francisco, CA', '415-555-0407', NULL),
('Orangetheory Austin', 'gym', 30.2672, -97.7431, 4.5, 2, 'Austin interval training', '["parking", "locker_rooms"]', 'Mon-Fri 5am-8pm', '507 Pressler St, Austin, TX', '512-555-0406', NULL),
('24 Hour Fitness LA', 'gym', 34.0522, -118.2437, 4.0, 2, 'LA fitness chain', '["parking", "locker_rooms", "pool"]', 'Mon-Sun 24 hours', '1645 Corinth Ave, Los Angeles, CA', '310-555-0403', NULL),
('LA Fitness Chicago', 'gym', 41.8781, -87.6298, 3.9, 2, 'Chicago fitness center', '["parking", "locker_rooms"]', 'Mon-Fri 5am-11pm', '330 S Franklin St, Chicago, IL', '312-555-0404', NULL),

-- Grocery Stores
('Whole Foods SF', 'grocery', 37.7897, -122.4011, 4.2, 3, 'Organic grocery chain', '["parking", "wifi", "cafe"]', 'Mon-Sun 8am-10pm', '399 4th St, San Francisco, CA', '415-555-0501', NULL),
('Trader Joe''s NYC', 'grocery', 40.7282, -73.9942, 4.5, 1, 'NYC quirky grocery chain', '["wifi"]', 'Mon-Sun 8am-10pm', '142 E 14th St, New York, NY', '212-555-0502', NULL),
('H-E-B Austin', 'grocery', 30.2672, -97.7431, 4.6, 2, 'Texas grocery favorite', '["parking", "wifi"]', 'Mon-Sun 6am-11pm', '1000 E 41st St, Austin, TX', '512-555-0504', NULL),
('New Seasons Portland', 'grocery', 45.5152, -122.6551, 4.4, 2, 'Portland local grocer', '["parking", "wifi", "cafe"]', 'Mon-Sun 7am-10pm', '1214 SE Tacoma St, Portland, OR', '503-555-0505', NULL),
('Whole Foods Chicago', 'grocery', 41.8781, -87.6298, 4.3, 3, 'Chicago organic grocery', '["parking", "wifi", "cafe"]', 'Mon-Sun 7am-10pm', '30 W Huron St, Chicago, IL', '312-555-0506', NULL);
