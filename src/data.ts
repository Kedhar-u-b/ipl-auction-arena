import { Player } from './types';

export const ALL_PLAYERS: Player[] = [
  // ===== MARQUEE BATERS (Indian) =====
  { id: 1, name: 'Virat Kohli', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 2.0, rating: 97, stats: { matches: 252, runs: 8004, average: 37.8, strikeRate: 130.7 }, speciality: 'Right-hand bat', isMarquee: true },
  { id: 2, name: 'Rohit Sharma', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 2.0, rating: 94, stats: { matches: 257, runs: 6782, average: 29.3, strikeRate: 130.6 }, speciality: 'Right-hand bat, Captain', isMarquee: true },
  { id: 3, name: 'Shubman Gill', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 2.0, rating: 90, stats: { matches: 100, runs: 3250, average: 37.8, strikeRate: 133.5 }, speciality: 'Right-hand bat', isMarquee: true },
  { id: 4, name: 'KL Rahul', role: 'Wicket-Keeper', nationality: 'Indian', country: 'India', basePrice: 2.0, rating: 91, stats: { matches: 142, runs: 4930, average: 45.6, strikeRate: 135.2 }, speciality: 'Right-hand bat, WK', isMarquee: true },
  { id: 5, name: 'Rishabh Pant', role: 'Wicket-Keeper', nationality: 'Indian', country: 'India', basePrice: 2.0, rating: 90, stats: { matches: 118, runs: 3965, average: 32.5, strikeRate: 148.1 }, speciality: 'Left-hand bat, WK', isMarquee: true },

  // ===== MARQUEE ALL-ROUNDERS =====
  { id: 6, name: 'Hardik Pandya', role: 'All-Rounder', nationality: 'Indian', country: 'India', basePrice: 2.0, rating: 92, stats: { matches: 137, runs: 2525, wickets: 78, average: 28.1, strikeRate: 145.2, economy: 8.7 }, speciality: 'Right-hand bat, Right-arm fast-medium', isMarquee: true },
  { id: 7, name: 'Ravindra Jadeja', role: 'All-Rounder', nationality: 'Indian', country: 'India', basePrice: 2.0, rating: 93, stats: { matches: 240, runs: 3172, wickets: 168, average: 26.4, strikeRate: 130.1, economy: 7.6 }, speciality: 'Left-hand bat, Left-arm spin', isMarquee: true },

  // ===== MARQUEE BOWLERS =====
  { id: 8, name: 'Jasprit Bumrah', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 2.0, rating: 98, stats: { matches: 145, wickets: 185, average: 18.5, economy: 6.6 }, speciality: 'Right-arm fast', isMarquee: true },
  { id: 9, name: 'Rashid Khan', role: 'Bowler', nationality: 'Overseas', country: 'Afghanistan', basePrice: 2.0, rating: 95, stats: { matches: 132, wickets: 165, average: 17.8, economy: 6.5 }, speciality: 'Right-arm leg-spin', isMarquee: true },

  // ===== MARQUEE OVERSEAS BATSMEN =====
  { id: 10, name: 'Jos Buttler', role: 'Wicket-Keeper', nationality: 'Overseas', country: 'England', basePrice: 2.0, rating: 95, stats: { matches: 115, runs: 4125, average: 39.5, strikeRate: 150.3 }, speciality: 'Right-hand bat, WK', isMarquee: true },
  { id: 11, name: 'Travis Head', role: 'Batter', nationality: 'Overseas', country: 'Australia', basePrice: 2.0, rating: 89, stats: { matches: 58, runs: 1750, average: 33.6, strikeRate: 145.8 }, speciality: 'Left-hand bat', isMarquee: true },
  { id: 12, name: 'Glenn Maxwell', role: 'All-Rounder', nationality: 'Overseas', country: 'Australia', basePrice: 1.5, rating: 88, stats: { matches: 148, runs: 3050, wickets: 32, average: 23.5, strikeRate: 158.2, economy: 8.5 }, speciality: 'Right-hand bat, Right-arm off-break', isMarquee: true },

  // ===== TOP INDIAN BATSMEN =====
  { id: 13, name: 'Yashasvi Jaiswal', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 1.5, rating: 88, stats: { matches: 52, runs: 1820, average: 36.4, strikeRate: 142.5 }, speciality: 'Left-hand bat', isMarquee: false },
  { id: 14, name: 'Ruturaj Gaikwad', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 1.5, rating: 86, stats: { matches: 66, runs: 2150, average: 35.8, strikeRate: 134.2 }, speciality: 'Right-hand bat', isMarquee: false },
  { id: 15, name: 'Sanju Samson', role: 'Wicket-Keeper', nationality: 'Indian', country: 'India', basePrice: 1.5, rating: 86, stats: { matches: 162, runs: 4250, average: 28.6, strikeRate: 138.5 }, speciality: 'Right-hand bat, WK', isMarquee: false },
  { id: 16, name: 'Suryakumar Yadav', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 1.5, rating: 91, stats: { matches: 140, runs: 3850, average: 31.8, strikeRate: 147.3 }, speciality: 'Right-hand bat, 360° player', isMarquee: false },
  { id: 17, name: 'Shreyas Iyer', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 1.5, rating: 84, stats: { matches: 125, runs: 3420, average: 30.5, strikeRate: 128.7 }, speciality: 'Right-hand bat', isMarquee: false },
  { id: 18, name: 'Ishan Kishan', role: 'Wicket-Keeper', nationality: 'Indian', country: 'India', basePrice: 1.0, rating: 82, stats: { matches: 105, runs: 2750, average: 26.8, strikeRate: 136.5 }, speciality: 'Left-hand bat, WK', isMarquee: false },
  { id: 19, name: 'Abhishek Sharma', role: 'All-Rounder', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 80, stats: { matches: 38, runs: 680, wickets: 15, strikeRate: 152.3, economy: 8.2 }, speciality: 'Left-hand bat, Left-arm spin', isMarquee: false },
  { id: 20, name: 'Tilak Varma', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 79, stats: { matches: 52, runs: 1250, average: 29.8, strikeRate: 139.5 }, speciality: 'Left-hand bat', isMarquee: false },
  { id: 21, name: 'Sai Sudharsan', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 78, stats: { matches: 30, runs: 850, average: 32.7, strikeRate: 131.8 }, speciality: 'Left-hand bat', isMarquee: false },
  { id: 22, name: 'Nitish Rana', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 0.75, rating: 77, stats: { matches: 120, runs: 2980, average: 26.2, strikeRate: 135.8 }, speciality: 'Left-hand bat', isMarquee: false },
  { id: 23, name: 'Rajat Patidar', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 76, stats: { matches: 28, runs: 720, average: 28.8, strikeRate: 142.5 }, speciality: 'Right-hand bat', isMarquee: false },
  { id: 24, name: 'Prithvi Shaw', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 0.75, rating: 75, stats: { matches: 79, runs: 1892, average: 24.9, strikeRate: 147.5 }, speciality: 'Right-hand bat', isMarquee: false },

  // ===== TOP OVERSEAS BATSMEN =====
  { id: 25, name: 'David Warner', role: 'Batter', nationality: 'Overseas', country: 'Australia', basePrice: 1.5, rating: 85, stats: { matches: 190, runs: 6398, average: 41.2, strikeRate: 139.9 }, speciality: 'Left-hand bat', isMarquee: false },
  { id: 26, name: 'Quinton de Kock', role: 'Wicket-Keeper', nationality: 'Overseas', country: 'South Africa', basePrice: 1.0, rating: 84, stats: { matches: 110, runs: 3150, average: 30.6, strikeRate: 138.2 }, speciality: 'Left-hand bat, WK', isMarquee: false },
  { id: 27, name: 'Devon Conway', role: 'Batter', nationality: 'Overseas', country: 'New Zealand', basePrice: 0.75, rating: 82, stats: { matches: 42, runs: 1120, average: 31.4, strikeRate: 131.5 }, speciality: 'Left-hand bat', isMarquee: false },
  { id: 28, name: 'Faf du Plessis', role: 'Batter', nationality: 'Overseas', country: 'South Africa', basePrice: 1.0, rating: 82, stats: { matches: 155, runs: 4225, average: 30.3, strikeRate: 133.5 }, speciality: 'Right-hand bat', isMarquee: false },
  { id: 29, name: 'Kane Williamson', role: 'Batter', nationality: 'Overseas', country: 'New Zealand', basePrice: 1.0, rating: 83, stats: { matches: 82, runs: 2380, average: 33.5, strikeRate: 125.8 }, speciality: 'Right-hand bat', isMarquee: false },

  // ===== INDIAN ALL-ROUNDERS =====
  { id: 30, name: 'Axar Patel', role: 'All-Rounder', nationality: 'Indian', country: 'India', basePrice: 1.5, rating: 87, stats: { matches: 165, runs: 1850, wickets: 130, average: 22.5, strikeRate: 125.8, economy: 7.1 }, speciality: 'Left-hand bat, Left-arm spin', isMarquee: false },
  { id: 31, name: 'Ravichandran Ashwin', role: 'All-Rounder', nationality: 'Indian', country: 'India', basePrice: 1.0, rating: 82, stats: { matches: 215, runs: 1580, wickets: 180, average: 24.5, economy: 6.9 }, speciality: 'Right-hand bat, Right-arm off-break', isMarquee: false },
  { id: 32, name: 'Washington Sundar', role: 'All-Rounder', nationality: 'Indian', country: 'India', basePrice: 0.75, rating: 78, stats: { matches: 65, runs: 520, wickets: 48, economy: 7.3 }, speciality: 'Left-hand bat, Right-arm off-break', isMarquee: false },
  { id: 33, name: 'Krunal Pandya', role: 'All-Rounder', nationality: 'Indian', country: 'India', basePrice: 0.75, rating: 77, stats: { matches: 130, runs: 1580, wickets: 75, economy: 7.4 }, speciality: 'Left-hand bat, Left-arm spin', isMarquee: false },
  { id: 34, name: 'Shivam Dube', role: 'All-Rounder', nationality: 'Indian', country: 'India', basePrice: 0.75, rating: 80, stats: { matches: 62, runs: 1120, wickets: 15, strikeRate: 145.8, economy: 9.2 }, speciality: 'Left-hand bat, Right-arm medium', isMarquee: false },
  { id: 35, name: 'Venkatesh Iyer', role: 'All-Rounder', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 76, stats: { matches: 52, runs: 850, wickets: 12, strikeRate: 135.2, economy: 8.8 }, speciality: 'Left-hand bat, Right-arm medium', isMarquee: false },
  { id: 36, name: 'Rahul Tewatia', role: 'All-Rounder', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 75, stats: { matches: 88, runs: 950, wickets: 38, strikeRate: 138.5, economy: 7.8 }, speciality: 'Left-hand bat, Right-arm leg-spin', isMarquee: false },

  // ===== OVERSEAS ALL-ROUNDERS =====
  { id: 37, name: 'Sam Curran', role: 'All-Rounder', nationality: 'Overseas', country: 'England', basePrice: 1.5, rating: 86, stats: { matches: 58, runs: 780, wickets: 65, average: 22.5, strikeRate: 132.5, economy: 8.5 }, speciality: 'Left-hand bat, Left-arm medium-fast', isMarquee: false },
  { id: 38, name: 'Marcus Stoinis', role: 'All-Rounder', nationality: 'Overseas', country: 'Australia', basePrice: 1.0, rating: 82, stats: { matches: 95, runs: 1680, wickets: 32, strikeRate: 142.5, economy: 9.0 }, speciality: 'Right-hand bat, Right-arm medium', isMarquee: false },
  { id: 39, name: 'Cameron Green', role: 'All-Rounder', nationality: 'Overseas', country: 'Australia', basePrice: 1.0, rating: 81, stats: { matches: 32, runs: 520, wickets: 22, strikeRate: 135.8, economy: 8.8 }, speciality: 'Right-hand bat, Right-arm fast-medium', isMarquee: false },
  { id: 40, name: 'Liam Livingstone', role: 'All-Rounder', nationality: 'Overseas', country: 'England', basePrice: 1.0, rating: 82, stats: { matches: 42, runs: 780, wickets: 18, strikeRate: 155.2, economy: 8.8 }, speciality: 'Right-hand bat, Right-arm leg-spin', isMarquee: false },
  { id: 41, name: 'Mitchell Marsh', role: 'All-Rounder', nationality: 'Overseas', country: 'Australia', basePrice: 1.0, rating: 80, stats: { matches: 48, runs: 750, wickets: 25, strikeRate: 138.5, economy: 8.5 }, speciality: 'Right-hand bat, Right-arm medium', isMarquee: false },
  { id: 42, name: 'Rachin Ravindra', role: 'All-Rounder', nationality: 'Overseas', country: 'New Zealand', basePrice: 0.75, rating: 79, stats: { matches: 25, runs: 450, wickets: 12, strikeRate: 135.5, economy: 7.8 }, speciality: 'Left-hand bat, Left-arm spin', isMarquee: false },
  { id: 43, name: 'Marco Jansen', role: 'All-Rounder', nationality: 'Overseas', country: 'South Africa', basePrice: 0.75, rating: 78, stats: { matches: 28, runs: 280, wickets: 32, economy: 8.5 }, speciality: 'Left-hand bat, Left-arm fast', isMarquee: false },
  { id: 44, name: 'Daryl Mitchell', role: 'All-Rounder', nationality: 'Overseas', country: 'New Zealand', basePrice: 0.75, rating: 78, stats: { matches: 25, runs: 420, wickets: 8, strikeRate: 138.2, economy: 8.8 }, speciality: 'Right-hand bat, Right-arm medium', isMarquee: false },

  // ===== INDIAN BOWLERS =====
  { id: 45, name: 'Mohammed Shami', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 1.5, rating: 88, stats: { matches: 125, wickets: 155, average: 22.8, economy: 7.5 }, speciality: 'Right-arm fast-medium', isMarquee: false },
  { id: 46, name: 'Yuzvendra Chahal', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 1.0, rating: 85, stats: { matches: 165, wickets: 205, average: 21.5, economy: 7.6 }, speciality: 'Right-arm leg-spin', isMarquee: false },
  { id: 47, name: 'Kuldeep Yadav', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 1.0, rating: 84, stats: { matches: 92, wickets: 112, average: 23.2, economy: 7.3 }, speciality: 'Left-arm wrist-spin', isMarquee: false },
  { id: 48, name: 'Arshdeep Singh', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 1.0, rating: 83, stats: { matches: 68, wickets: 88, average: 24.5, economy: 8.1 }, speciality: 'Left-arm fast-medium', isMarquee: false },
  { id: 49, name: 'Mohammed Siraj', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 1.0, rating: 83, stats: { matches: 88, wickets: 98, average: 25.2, economy: 7.8 }, speciality: 'Right-arm fast', isMarquee: false },
  { id: 50, name: 'Bhuvneshwar Kumar', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.75, rating: 80, stats: { matches: 180, wickets: 195, average: 23.8, economy: 7.2 }, speciality: 'Right-arm medium-fast', isMarquee: false },
  { id: 51, name: 'Ravi Bishnoi', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.75, rating: 79, stats: { matches: 55, wickets: 62, average: 24.8, economy: 7.5 }, speciality: 'Right-arm leg-spin', isMarquee: false },
  { id: 52, name: 'Prasidh Krishna', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.75, rating: 78, stats: { matches: 55, wickets: 62, average: 25.8, economy: 8.2 }, speciality: 'Right-arm fast', isMarquee: false },
  { id: 53, name: 'Shardul Thakur', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.75, rating: 78, stats: { matches: 105, wickets: 98, average: 28.5, economy: 8.5 }, speciality: 'Right-arm medium-fast', isMarquee: false },
  { id: 54, name: 'Deepak Chahar', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.75, rating: 76, stats: { matches: 82, wickets: 78, average: 26.5, economy: 7.5 }, speciality: 'Right-arm medium-fast', isMarquee: false },
  { id: 55, name: 'Harshal Patel', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.75, rating: 78, stats: { matches: 128, wickets: 148, average: 23.2, economy: 8.5 }, speciality: 'Right-arm medium-fast', isMarquee: false },
  { id: 56, name: 'Mukesh Kumar', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 75, stats: { matches: 38, wickets: 42, average: 26.8, economy: 8.5 }, speciality: 'Right-arm fast-medium', isMarquee: false },
  { id: 57, name: 'Umran Malik', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 76, stats: { matches: 32, wickets: 35, average: 28.5, economy: 9.2 }, speciality: 'Right-arm fast (150+ kph)', isMarquee: false },
  { id: 58, name: 'Avesh Khan', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 75, stats: { matches: 48, wickets: 52, average: 27.2, economy: 8.5 }, speciality: 'Right-arm fast-medium', isMarquee: false },
  { id: 59, name: 'T Natarajan', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 75, stats: { matches: 42, wickets: 45, average: 27.5, economy: 8.3 }, speciality: 'Left-arm fast-medium', isMarquee: false },
  { id: 60, name: 'Sandeep Sharma', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 74, stats: { matches: 125, wickets: 135, average: 25.8, economy: 7.5 }, speciality: 'Right-arm medium-fast', isMarquee: false },

  // ===== OVERSEAS BOWLERS =====
  { id: 61, name: 'Pat Cummins', role: 'Bowler', nationality: 'Overseas', country: 'Australia', basePrice: 2.0, rating: 92, stats: { matches: 72, wickets: 95, average: 21.5, economy: 7.8 }, speciality: 'Right-arm fast, Captain', isMarquee: false },
  { id: 62, name: 'Mitchell Starc', role: 'Bowler', nationality: 'Overseas', country: 'Australia', basePrice: 2.0, rating: 93, stats: { matches: 48, wickets: 68, average: 19.5, economy: 7.5 }, speciality: 'Left-arm fast', isMarquee: false },
  { id: 63, name: 'Kagiso Rabada', role: 'Bowler', nationality: 'Overseas', country: 'South Africa', basePrice: 1.5, rating: 90, stats: { matches: 85, wickets: 115, average: 20.8, economy: 7.9 }, speciality: 'Right-arm fast', isMarquee: false },
  { id: 64, name: 'Trent Boult', role: 'Bowler', nationality: 'Overseas', country: 'New Zealand', basePrice: 1.0, rating: 86, stats: { matches: 98, wickets: 120, average: 22.5, economy: 7.8 }, speciality: 'Left-arm fast-medium', isMarquee: false },
  { id: 65, name: 'Josh Hazlewood', role: 'Bowler', nationality: 'Overseas', country: 'Australia', basePrice: 1.0, rating: 85, stats: { matches: 52, wickets: 62, average: 22.8, economy: 7.5 }, speciality: 'Right-arm fast', isMarquee: false },
  { id: 66, name: 'Wanindu Hasaranga', role: 'Bowler', nationality: 'Overseas', country: 'Sri Lanka', basePrice: 1.0, rating: 83, stats: { matches: 42, wickets: 55, average: 20.5, economy: 7.2 }, speciality: 'Right-arm leg-spin', isMarquee: false },
  { id: 67, name: 'Matheesha Pathirana', role: 'Bowler', nationality: 'Overseas', country: 'Sri Lanka', basePrice: 0.75, rating: 82, stats: { matches: 32, wickets: 42, average: 22.5, economy: 8.2 }, speciality: 'Right-arm fast (Malinga action)', isMarquee: false },
  { id: 68, name: 'Mustafizur Rahman', role: 'Bowler', nationality: 'Overseas', country: 'Bangladesh', basePrice: 0.75, rating: 80, stats: { matches: 68, wickets: 78, average: 25.2, economy: 7.8 }, speciality: 'Left-arm fast-medium', isMarquee: false },
  { id: 69, name: 'Lockie Ferguson', role: 'Bowler', nationality: 'Overseas', country: 'New Zealand', basePrice: 0.75, rating: 79, stats: { matches: 45, wickets: 48, average: 26.5, economy: 8.2 }, speciality: 'Right-arm fast (150+ kph)', isMarquee: false },
  { id: 70, name: 'Anrich Nortje', role: 'Bowler', nationality: 'Overseas', country: 'South Africa', basePrice: 0.75, rating: 81, stats: { matches: 42, wickets: 52, average: 23.8, economy: 8.0 }, speciality: 'Right-arm fast (150+ kph)', isMarquee: false },
  { id: 71, name: 'Adil Rashid', role: 'Bowler', nationality: 'Overseas', country: 'England', basePrice: 0.75, rating: 79, stats: { matches: 38, wickets: 42, average: 25.5, economy: 7.5 }, speciality: 'Right-arm leg-spin', isMarquee: false },
  { id: 72, name: 'Adam Zampa', role: 'Bowler', nationality: 'Overseas', country: 'Australia', basePrice: 0.5, rating: 78, stats: { matches: 45, wickets: 48, average: 25.8, economy: 7.4 }, speciality: 'Right-arm leg-spin', isMarquee: false },
  { id: 73, name: 'Chris Jordan', role: 'Bowler', nationality: 'Overseas', country: 'England', basePrice: 0.5, rating: 75, stats: { matches: 42, wickets: 38, average: 28.5, economy: 8.8 }, speciality: 'Right-arm fast-medium, Death overs', isMarquee: false },
  { id: 74, name: 'Reece Topley', role: 'Bowler', nationality: 'Overseas', country: 'England', basePrice: 0.5, rating: 76, stats: { matches: 25, wickets: 28, average: 25.2, economy: 8.0 }, speciality: 'Left-arm fast-medium', isMarquee: false },

  // ===== ADDITIONAL PLAYERS =====
  { id: 75, name: 'Rahul Tripathi', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 76, stats: { matches: 105, runs: 2280, average: 23.5, strikeRate: 142.8 }, speciality: 'Right-hand bat', isMarquee: false },
  { id: 76, name: 'Vijay Shankar', role: 'All-Rounder', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 73, stats: { matches: 55, runs: 580, wickets: 15, strikeRate: 128.5, economy: 8.5 }, speciality: 'Right-hand bat, Right-arm medium', isMarquee: false },
  { id: 77, name: 'Navdeep Saini', role: 'Bowler', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 74, stats: { matches: 38, wickets: 38, average: 28.2, economy: 8.8 }, speciality: 'Right-arm fast', isMarquee: false },
  { id: 78, name: 'Moeen Ali', role: 'All-Rounder', nationality: 'Overseas', country: 'England', basePrice: 1.0, rating: 80, stats: { matches: 72, runs: 1250, wickets: 42, strikeRate: 142.5, economy: 7.5 }, speciality: 'Left-hand bat, Right-arm off-break', isMarquee: false },
  { id: 79, name: 'Devdutt Padikkal', role: 'Batter', nationality: 'Indian', country: 'India', basePrice: 0.5, rating: 74, stats: { matches: 60, runs: 1350, average: 24.5, strikeRate: 132.5 }, speciality: 'Left-hand bat', isMarquee: false },
  { id: 80, name: 'Shimron Hetmyer', role: 'Batter', nationality: 'Overseas', country: 'West Indies', basePrice: 0.75, rating: 78, stats: { matches: 65, runs: 1380, average: 24.2, strikeRate: 148.5 }, speciality: 'Left-hand bat, Finisher', isMarquee: false },
];

export const IPL_TEAMS = [
  { id: 'csk', name: 'Chennai Super Kings', shortName: 'CSK', color: '#FFC107', textColor: '#1a1a00', emoji: '🦁', personality: 'balanced' as const },
  { id: 'mi', name: 'Mumbai Indians', shortName: 'MI', color: '#004BA0', textColor: '#ffffff', emoji: '🏏', personality: 'aggressive' as const },
  { id: 'rcb', name: 'Royal Challengers Bengaluru', shortName: 'RCB', color: '#EC1C24', textColor: '#ffffff', emoji: '🔴', personality: 'aggressive' as const },
  { id: 'kkr', name: 'Kolkata Knight Riders', shortName: 'KKR', color: '#3A225D', textColor: '#ffffff', emoji: '🟣', personality: 'aggressive' as const },
  { id: 'dc', name: 'Delhi Capitals', shortName: 'DC', color: '#0078BC', textColor: '#ffffff', emoji: '🔵', personality: 'balanced' as const },
  { id: 'pbks', name: 'Punjab Kings', shortName: 'PBKS', color: '#DD1F2D', textColor: '#ffffff', emoji: '🔴', personality: 'aggressive' as const },
  { id: 'rr', name: 'Rajasthan Royals', shortName: 'RR', color: '#EA1A85', textColor: '#ffffff', emoji: '🩷', personality: 'balanced' as const },
  { id: 'srh', name: 'Sunrisers Hyderabad', shortName: 'SRH', color: '#FF822A', textColor: '#ffffff', emoji: '🟠', personality: 'aggressive' as const },
  { id: 'gt', name: 'Gujarat Titans', shortName: 'GT', color: '#1B2133', textColor: '#ffffff', emoji: '🛡️', personality: 'conservative' as const },
  { id: 'lsg', name: 'Lucknow Super Giants', shortName: 'LSG', color: '#A72056', textColor: '#ffffff', emoji: '🦏', personality: 'balanced' as const },
];

export const INITIAL_BUDGET = 120; // Crores

export function getBidIncrement(currentBid: number): number {
  if (currentBid < 1) return 0.1;
  if (currentBid < 5) return 0.25;
  if (currentBid < 10) return 0.5;
  if (currentBid < 20) return 1.0;
  return 2.0;
}

export function getNextBid(currentBid: number, basePrice: number): number {
  const base = currentBid > 0 ? currentBid : basePrice;
  return Math.round((base + getBidIncrement(base)) * 100) / 100;
}

export function getRoleEmoji(role: string): string {
  switch (role) {
    case 'Batter': return '🏏';
    case 'Bowler': return '🎯';
    case 'All-Rounder': return '⭐';
    case 'Wicket-Keeper': return '🧤';
    default: return '🏏';
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case 'Batter': return '#3b82f6';
    case 'Bowler': return '#22c55e';
    case 'All-Rounder': return '#f59e0b';
    case 'Wicket-Keeper': return '#a855f7';
    default: return '#6b7280';
  }
}

export function formatPrice(amount: number): string {
  if (amount >= 1) {
    return `₹${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)} Cr`;
  }
  return `₹${(amount * 100).toFixed(0)} L`;
}
