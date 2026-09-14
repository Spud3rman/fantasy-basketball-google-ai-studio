import type { Player, ScoringRules } from '../types';

export const DEFAULT_SCORING_RULES: ScoringRules = {
  pts: 1.0,
  reb: 1.2,
  ast: 1.5,
  stl: 3.0,
  blk: 3.0,
  fg3m: 1.0,
  to: -1.0,
  doubleDoubleBonus: 2.0,
  tripleDoubleBonus: 5.0,
};

export function calculateFantasyPoints(
  stats: {
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    fg3m: number;
    to: number;
  },
  rules: ScoringRules = DEFAULT_SCORING_RULES
): number {
  let fp =
    stats.pts * rules.pts +
    stats.reb * rules.reb +
    stats.ast * rules.ast +
    stats.stl * rules.stl +
    stats.blk * rules.blk +
    stats.fg3m * rules.fg3m +
    stats.to * rules.to;

  let doubleCategories = 0;
  if (stats.pts >= 10) doubleCategories++;
  if (stats.reb >= 10) doubleCategories++;
  if (stats.ast >= 10) doubleCategories++;
  if (stats.stl >= 10) doubleCategories++;
  if (stats.blk >= 10) doubleCategories++;

  if (doubleCategories >= 3) {
    fp += rules.tripleDoubleBonus;
  } else if (doubleCategories >= 2) {
    fp += rules.doubleDoubleBonus;
  }

  return Math.round(fp * 10) / 10;
}

export const AUTHENTIC_NBA_TEAMS: Record<string, { team: string; teamName: string }> = {
  "luka doncic": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "joel embiid": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "nikola jokic": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "giannis antetokounmpo": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "anthony davis": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "victor wembanyama": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "shai gilgeous-alexander": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "domantas sabonis": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "lebron james": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "trae young": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "jayson tatum": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "tyrese haliburton": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "donovan mitchell": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "kevin durant": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "de'aaron fox": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "ja morant": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "lamelo ball": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "jalen brunson": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "devin booker": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "scottie barnes": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "kyrie irving": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "tyrese maxey": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "stephen curry": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "anthony edwards": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "damian lillard": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "kawhi leonard": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "bam adebayo": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "dejounte murray": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "alperen sengun": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "julius randle": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "desmond bane": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "fred vanvleet": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "lauri markkanen": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "paolo banchero": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "nikola vucevic": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "cade cunningham": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "jamal murray": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "demar derozan": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "paul george": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "james harden": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "jaren jackson jr.": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "rudy gobert": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "jaylen brown": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "zion williamson": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "karl-anthony towns": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "kristaps porzingis": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "kyle kuzma": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "miles bridges": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "jarrett allen": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "pascal siakam": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "jimmy butler": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "cj mccollum": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "brandon ingram": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "chet holmgren": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "deandre ayton": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "anfernee simons": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "jalen johnson": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "evan mobley": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "tyler herro": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "jusuf nurkic": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "d'angelo russell": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "mikal bridges": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "derrick white": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "franz wagner": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "jalen williams": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "coby white": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "devin vassell": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "zach lavine": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "jalen duren": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "tobias harris": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "myles turner": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "jalen green": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "bradley beal": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "darius garland": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "rj barrett": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "cam thomas": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "nic claxton": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "jerami grant": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "clint capela": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "terry rozier": {
    "team": "FA",
    "teamName": "Free Agent"
  },
  "immanuel quickley": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "michael porter jr.": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "austin reaves": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "dyson daniels": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "khris middleton": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "collin sexton": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "bogdan bogdanovic": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "jrue holiday": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "jordan poole": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "brandon miller": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "john collins": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "jabari smith jr.": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "brook lopez": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "draymond green": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "alex sarr": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "klay thompson": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "daniel gafford": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "jakob poeltl": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "aaron gordon": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "trey murphy iii": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "og anunoby": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "josh giddey": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "dennis schroder": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "shaedon sharpe": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "jonas valanciunas": {
    "team": "FA",
    "teamName": "Free Agent"
  },
  "grayson allen": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "p.j. washington": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "bobby portis": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "ivica zubac": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "jaden ivey": {
    "team": "FA",
    "teamName": "Free Agent"
  },
  "chris paul": {
    "team": "FA",
    "teamName": "Free Agent"
  },
  "jonathan kuminga": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "jeremy sochan": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "cameron johnson": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "jalen suggs": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "walker kessler": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "herbert jones": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "amen thompson": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "wendell carter jr.": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "aaron nesmith": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "bennedict mathurin": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "keyonte george": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "dereck lively ii": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "zaccharie risacher": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "jaime jaquez jr.": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "andrew nembhard": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "nikola jovic": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "kentavious caldwell-pope": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "norman powell": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "nickeil alexander-walker": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "rayj dennis": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "luguentz dort": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "zuby ejiofor": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "kingston flemings": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "keshon gilbert": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "mouhamed gueye": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "buddy hield": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "corey kispert": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "jock landale": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "ryan nembhard": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "asa newell": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "onyeka okongwu": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "henri veesaar": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "aaron wiggins": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "jalen wilson": {
    "team": "ATL",
    "teamName": "Atlanta Hawks"
  },
  "tobe awaka": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "matas buzelis": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "zach collins": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "rob dillingham": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "noa essengue": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "tre jones": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "mac mcclung": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "leonard miller": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "isaac okoro": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "jalen smith": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "dailyn swain": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "patrick williams": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "caleb wilson": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "guerschon yabusele": {
    "team": "CHI",
    "teamName": "Chicago Bulls"
  },
  "kobe brown": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "johnny furphy": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "jay huff": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "quenton jackson": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "t.j. mcconnell": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "larry nance jr.": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "kelly oubre jr.": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "ben sheppard": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "jalen slawson": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "braden smith": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "obi toppin": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "jarace walker": {
    "team": "IND",
    "teamName": "Indiana Pacers"
  },
  "charles bassey": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "jimmy butler iii": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "lj cryer": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "al horford": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "lajae jones": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "yaxel lendeborg": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "malevy leons": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "de'anthony melton": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "moses moody": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "georges niang": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "gary payton ii": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "brandin podziemski": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "will richard": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "gui santos": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "brandon williams": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "nate williams": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  },
  "steven adams": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "rafael castro": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "quadir copeland": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "isaiah crawford": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "tari eason": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "sean pedulla": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "reed sheppard": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "marcus smart": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "jae'sean tate": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "bruce thornton": {
    "team": "HOU",
    "teamName": "Houston Rockets"
  },
  "deni avdija": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "toumani camara": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "branden carlson": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "sidy cissoko": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "donovan clingan": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "yang hansen": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "scoot henderson": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "jayson kent": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "vit krejci": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "micah potter": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "john tonje": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "robert williams iii": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "chris youngblood": {
    "team": "POR",
    "teamName": "Portland Trail Blazers"
  },
  "kyle anderson": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "jamison battle": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "nate bittle": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "jaden bradley": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "allen graves": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "chucky hepburn": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "andre jackson jr.": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "trayce jackson-davis": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "trey jemison iii": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "a.j. lawson": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "alijah martin": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "collin murray-boyles": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "jamal shead": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "ja'kobe walter": {
    "team": "TOR",
    "teamName": "Toronto Raptors"
  },
  "joan beringer": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "jaylen clark": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "donte divincenzo": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "ayo dosunmu": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "isaiah evans": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "enrique freeman": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "bones hyland": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "trey kaufman-renn": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "john konchar": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "trey lyles": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "jaden mcdaniels": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "julian phillips": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "zyon pullin": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "terrence shannon jr.": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "cody williams": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "rocco zikarsky": {
    "team": "MIN",
    "teamName": "Minnesota Timberwolves"
  },
  "jose alvarado": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "jordan clarkson": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "pacome dadiet": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "mohamed diawara": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "andre drummond": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "josh hart": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "jack kayil": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "tyler kolek": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "miles mcbride": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "kevin mccullar jr.": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "tyler nickel": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "landry shamet": {
    "team": "NYK",
    "teamName": "New York Knicks"
  },
  "christian anderson": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "pat connaughton": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "moussa diabate": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "dorian finney-smith": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "pj hall": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "sion james": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "ryan kalkbrenner": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "kon knueppel": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "liam mcneeley": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "royce o'neale": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "naz reid": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "tidjane salaun": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "hannes steinbach": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "grant williams": {
    "team": "CHA",
    "teamName": "Charlotte Hornets"
  },
  "bub carrington": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "justin champagnie": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "sharife cooper": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "bilal coulibaly": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "aj dybantsa": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "kyshawn george": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "caleb homesley": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "tre johnson": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "tre mann": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "felix okpara": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "will riley": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "tristan vukcevic": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "jamir watkins": {
    "team": "WAS",
    "teamName": "Washington Wizards"
  },
  "brooks barnhizer": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "alex caruso": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "josh dix": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "isaiah hartenstein": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "aday mara": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "jared mccain": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "ajay mitchell": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "otega oweh": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "thomas sorber": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "bennett stirtz": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "nikola topic": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "cason wallace": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "jaylin williams": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "kenrich williams": {
    "team": "OKC",
    "teamName": "Oklahoma City Thunder"
  },
  "javonte green": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "elijah harkless": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "gary harris": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "ronald holland ii": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "kevin huerter": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "daniss jenkins": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "isaiah joe": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "isaac jones": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "chaz lanier": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "wendell moore jr.": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "ebuka okorie": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "ugonna onyenso": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "taurean prince": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "paul reed": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "duncan robinson": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "tolu smith": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "ausar thompson": {
    "team": "DET",
    "teamName": "Detroit Pistons"
  },
  "harrison barnes": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "maliq brown": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "carter bryant": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "stephon castle": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "julian champagnie": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "ja'kobi gillespie": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "dylan harper": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "harrison ingram": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "keldon johnson": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "david jones garcia": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "luke kornet": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "jordan mclaughlin": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "emanuel miller": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "jayden quaintance": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "tarris reed jr.": {
    "team": "SAS",
    "teamName": "San Antonio Spurs"
  },
  "tyler bilodeau": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "armoni brooks": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "mikel brown jr.": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "noah clowney": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "egor demin": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "keon ellis": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "tyson etienne": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "joshua jefferson": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "chaney johnson": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "e.j. liddell": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "terance mann": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "josh minott": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "drake powell": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "ben saraf": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "day'ron sharpe": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "nolan traore": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "moritz wagner": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "danny wolf": {
    "team": "BKN",
    "teamName": "Brooklyn Nets"
  },
  "ryan conwell": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "tre donaldson": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "simone fontecchio": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "myron gardner": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "vladislav goldin": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "j'vonne hadley": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "tim hardaway jr.": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "keshad johnson": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "trevor keels": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "pelle larsson": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "davion mitchell": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "nick richards": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "dru smith": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "andrew wiggins": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "jahmir young": {
    "team": "MIA",
    "teamName": "Miami Heat"
  },
  "chris cenac jr.": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "mike conley": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "luka garza": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "hugo gonzalez": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "ron harper jr.": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "sam hauser": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "dillon mitchell": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "payton pritchard": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "neemias queta": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "mitchell robinson": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "baylor scheierman": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "jordan walsh": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "amari williams": {
    "team": "BOS",
    "teamName": "Boston Celtics"
  },
  "cameron carr": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "quentin grimes": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "jaden hardy": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "bronny james": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "dalton knecht": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "jake laravia": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "kevon looney": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "sandro mamukelashvili": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "chris manon": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "ak okereke": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "adou thiero": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "matisse thybulle": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "jarred vanderbilt": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "ziaire williams": {
    "team": "LAL",
    "teamName": "Los Angeles Lakers"
  },
  "thomas bryant": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "khalifa diop": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "tristan enaruna": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "mario hezonja": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "sam merrill": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "riley minix": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "craig porter jr.": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "tyrese proctor": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "olivier sarr": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "meleek thomas": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "nae'qwan tomlin": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "jaylon tyson": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "ernest udeh jr.": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "peyton watson": {
    "team": "CLE",
    "teamName": "Cleveland Cavaliers"
  },
  "marvin bagley iii": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "christian braun": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "trevon brazile": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "alpha diallo": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "daron holmes ii": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "bryce hopkins": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "spencer jones": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "tyus jones": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "zeke nnaji": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "david roddy": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "kj simpson": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "julian strawther": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "lonnie walker iv": {
    "team": "DEN",
    "teamName": "Denver Nuggets"
  },
  "cameron boozer": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "walter clayton jr.": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "cedric coward": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "zach edey": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "jordan hawkins": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "taylor hendricks": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "gg jackson": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "ty jerome": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "karim lopez": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "jahmai mashack": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "kris murray": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "micah peavy": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "scotty pippen jr.": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "quinten post": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "olivier-maxence prosper": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "richie saunders": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "javon small": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "cam spencer": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "isaiah stewart": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "jaylen wells": {
    "team": "MEM",
    "teamName": "Memphis Grizzlies"
  },
  "jamaree bouyea": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "koby brea": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "dillon brooks": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "ryan dunn": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "rasheer fleming": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "collin gillespie": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "jordan goodwin": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "haywood highsmith": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "cj huntley": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "oso ighodaro": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "luke kennard": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "isaiah livers": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "khaman maluach": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "koa peat": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "pat spencer": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "mark williams": {
    "team": "PHX",
    "teamName": "Phoenix Suns"
  },
  "johni broome": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "cam christie": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "gradey dick": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "kris dunn": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "rui hachimura": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "isaiah jackson": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "derrick jones jr.": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "nick martinelli": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "baba miller": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "jordan miller": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "narcisse ngoy": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "yanic konan niederhauser": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "jalen pickett": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "kobe sanders": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "jamarion sharp": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "max strus": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "keaton wagler": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "tyty washington jr.": {
    "team": "LAC",
    "teamName": "LA Clippers"
  },
  "goga bitadze": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "anthony black": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "malaki branham": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "jamal cain": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "jevon carter": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "colin castleton": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "tristan da silva": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "jd davison": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "jonathan isaac": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "alex morales": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "izaiyah nelson": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "noah penda": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "jase richardson": {
    "team": "ORL",
    "teamName": "Orlando Magic"
  },
  "nate ament": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "brayden burries": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "ousmane dieng": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "aj green": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "kasparas jakucionis": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "kam jones": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "caris levert": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "malique lewis": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "bogoljub markovic": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "pete nance": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "kevin porter jr.": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "ryan rollins": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "cormac ryan": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "jericho sims": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "gary trent jr.": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "kel'el ware": {
    "team": "MIL",
    "teamName": "Milwaukee Bucks"
  },
  "trey alexander": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "ace bailey": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "mo bamba": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "tamar bates": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "isaiah collier": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "kyle filipowski": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "josh green": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "jaxson hayes": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "blake hinson": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "bez mbeng": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "svi mykhailiuk": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "josh okogie": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "darryn peterson": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "brice sensabaugh": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "oscar tshiebwe": {
    "team": "UTA",
    "teamName": "Utah Jazz"
  },
  "santi aldama": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "tarik biberovic": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "max christie": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "moussa cisse": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "sergio de larrea": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "cooper flagg": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "jett howard": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "vsevolod ishchenko": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "morez johnson jr.": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "tobi lawal": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "naji marshall": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "caleb martin": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "john poulakidas": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "marcus sasser": {
    "team": "DAL",
    "teamName": "Dallas Mavericks"
  },
  "precious achiuwa": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "darius acuff jr.": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "dylan cardwell": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "nique clifford": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "adam flagler": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "de'andre hunter": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "alex karaban": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "jonathan mogbo": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "malik monk": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "keegan murray": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "daeqwon plowden": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "maxime raynaud": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "emanuel sharp": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "ben simmons": {
    "team": "SAC",
    "teamName": "Sacramento Kings"
  },
  "dominick barlow": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "adem bona": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "vj edgecombe": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "justin edwards": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "tacko fall": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "ariel hukporti": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "dillon jones": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "caleb love": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "duke miles": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "jameer nelson jr.": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "labaron philon jr.": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "rayan rupert": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "dean wade": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "jabari walker": {
    "team": "PHI",
    "teamName": "Philadelphia 76ers"
  },
  "saddiq bey": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "malik dia": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "jeremiah fears": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "aj johnson": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "deandre jordan": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "karlo matkovic": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "bryce mcgowens": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "yves missi": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "josh oduro": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "jaron pierre jr.": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "derik queen": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "trendon watford": {
    "team": "NOP",
    "teamName": "New Orleans Pelicans"
  },
  "cameron thomas": {
    "team": "GSW",
    "teamName": "Golden State Warriors"
  }
};

export function enforceAuthenticTeam<T extends { name: string; team?: string; teamName?: string }>(player: T): T {
  const norm = (player.name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const known = AUTHENTIC_NBA_TEAMS[norm];
  if (known) {
    return {
      ...player,
      team: known.team,
      teamName: known.teamName,
    };
  }
  return player;
}

export const INITIAL_NBA_PLAYERS: Player[] = [
  {
    "id": "p1",
    "name": "Nikola Jokić",
    "team": "DEN",
    "teamName": "Denver Nuggets",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3112335.png",
    "seasonStats": {
      "pts": 27.7,
      "reb": 12.9,
      "ast": 10.7,
      "stl": 1.4,
      "blk": 0.8,
      "fg3m": 1.7,
      "to": 3.7,
      "fantasyAvg": 63.8
    },
    "rank": 1,
    "adp": 1.2
  },
  {
    "id": "p2",
    "name": "Luka Dončić",
    "team": "LAL",
    "teamName": "Los Angeles Lakers",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3945274.png",
    "seasonStats": {
      "pts": 33.5,
      "reb": 7.7,
      "ast": 8.3,
      "stl": 1.6,
      "blk": 0.5,
      "fg3m": 4,
      "to": 4,
      "fantasyAvg": 61.5
    },
    "rank": 2,
    "adp": 1.9
  },
  {
    "id": "p5",
    "name": "Victor Wembanyama",
    "team": "SAS",
    "teamName": "San Antonio Spurs",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/5104157.png",
    "seasonStats": {
      "pts": 25,
      "reb": 11.5,
      "ast": 3.1,
      "stl": 1,
      "blk": 3.1,
      "fg3m": 1.9,
      "to": 2.4,
      "fantasyAvg": 55.3
    },
    "rank": 3,
    "adp": 3.4
  },
  {
    "id": "p4",
    "name": "Shai Gilgeous-Alexander",
    "team": "OKC",
    "teamName": "Oklahoma City Thunder",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4278073.png",
    "seasonStats": {
      "pts": 31.1,
      "reb": 4.3,
      "ast": 6.6,
      "stl": 1.4,
      "blk": 0.8,
      "fg3m": 1.7,
      "to": 2.2,
      "fantasyAvg": 52.3
    },
    "rank": 4,
    "adp": 4.2
  },
  {
    "id": "p21",
    "name": "Tyrese Maxey",
    "team": "PHI",
    "teamName": "Philadelphia 76ers",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4431678.png",
    "seasonStats": {
      "pts": 28.3,
      "reb": 4.1,
      "ast": 6.6,
      "stl": 1.9,
      "blk": 0.8,
      "fg3m": 3.1,
      "to": 2.4,
      "fantasyAvg": 51.9
    },
    "rank": 5,
    "adp": 4.9
  },
  {
    "id": "p37",
    "name": "Cade Cunningham",
    "team": "DET",
    "teamName": "Detroit Pistons",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4432166.png",
    "seasonStats": {
      "pts": 23.9,
      "reb": 5.5,
      "ast": 9.9,
      "stl": 1.4,
      "blk": 0.8,
      "fg3m": 2,
      "to": 3.7,
      "fantasyAvg": 50.2
    },
    "rank": 6,
    "adp": 6.4
  },
  {
    "id": "p36",
    "name": "Jalen Johnson",
    "team": "ATL",
    "teamName": "Atlanta Hawks",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4701230.png",
    "seasonStats": {
      "pts": 22.5,
      "reb": 10.3,
      "ast": 7.9,
      "stl": 1.2,
      "blk": 0.4,
      "fg3m": 1.7,
      "to": 3.4,
      "fantasyAvg": 49.8
    },
    "rank": 7,
    "adp": 7.2
  },
  {
    "id": "p3",
    "name": "Giannis Antetokounmpo",
    "team": "MIA",
    "teamName": "Miami Heat",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3032977.png",
    "seasonStats": {
      "pts": 27.6,
      "reb": 9.8,
      "ast": 5.4,
      "stl": 0.9,
      "blk": 0.7,
      "fg3m": 0.4,
      "to": 3.2,
      "fantasyAvg": 49.5
    },
    "rank": 8,
    "adp": 7.9
  },
  {
    "id": "p32",
    "name": "Kawhi Leonard",
    "team": "TOR",
    "teamName": "Toronto Raptors",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6450.png",
    "seasonStats": {
      "pts": 27.9,
      "reb": 6.4,
      "ast": 3.6,
      "stl": 1.9,
      "blk": 0.4,
      "fg3m": 2.6,
      "to": 2,
      "fantasyAvg": 48.5
    },
    "rank": 9,
    "adp": 9.4
  },
  {
    "id": "p17",
    "name": "Donovan Mitchell",
    "team": "CLE",
    "teamName": "Cleveland Cavaliers",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3908809.png",
    "seasonStats": {
      "pts": 27.9,
      "reb": 4.5,
      "ast": 5.7,
      "stl": 1.5,
      "blk": 0.3,
      "fg3m": 3.2,
      "to": 2.8,
      "fantasyAvg": 47.7
    },
    "rank": 10,
    "adp": 10.2
  },
  {
    "id": "p10",
    "name": "Anthony Edwards",
    "team": "MIN",
    "teamName": "Minnesota Timberwolves",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4594268.png",
    "seasonStats": {
      "pts": 28.8,
      "reb": 5,
      "ast": 3.7,
      "stl": 1.4,
      "blk": 0.8,
      "fg3m": 3.4,
      "to": 2.9,
      "fantasyAvg": 47.4
    },
    "rank": 11,
    "adp": 10.9
  },
  {
    "id": "p28",
    "name": "Jaylen Brown",
    "team": "PHI",
    "teamName": "Philadelphia 76ers",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3917376.png",
    "seasonStats": {
      "pts": 28.7,
      "reb": 6.9,
      "ast": 5.1,
      "stl": 1,
      "blk": 0.4,
      "fg3m": 2,
      "to": 3.6,
      "fantasyAvg": 47.2
    },
    "rank": 12,
    "adp": 12.4
  },
  {
    "id": "p8",
    "name": "Jayson Tatum",
    "team": "BOS",
    "teamName": "Boston Celtics",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4065648.png",
    "seasonStats": {
      "pts": 21.8,
      "reb": 10,
      "ast": 5.3,
      "stl": 1.4,
      "blk": 0.2,
      "fg3m": 2.9,
      "to": 2.4,
      "fantasyAvg": 47.1
    },
    "rank": 13,
    "adp": 13.2
  },
  {
    "id": "p44",
    "name": "Jamal Murray",
    "team": "DEN",
    "teamName": "Denver Nuggets",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3936299.png",
    "seasonStats": {
      "pts": 25.4,
      "reb": 4.4,
      "ast": 7.1,
      "stl": 0.9,
      "blk": 0.4,
      "fg3m": 3.3,
      "to": 2.3,
      "fantasyAvg": 46.2
    },
    "rank": 14,
    "adp": 13.9
  },
  {
    "id": "p29",
    "name": "Damian Lillard",
    "team": "POR",
    "teamName": "Portland Trail Blazers",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6606.png",
    "seasonStats": {
      "pts": 24.9,
      "reb": 4.7,
      "ast": 7.1,
      "stl": 1.2,
      "blk": 0.2,
      "fg3m": 3.4,
      "to": 2.8,
      "fantasyAvg": 46
    },
    "rank": 15,
    "adp": 15.4
  },
  {
    "id": "p7",
    "name": "Joel Embiid",
    "team": "PHI",
    "teamName": "Philadelphia 76ers",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3059318.png",
    "seasonStats": {
      "pts": 26.9,
      "reb": 7.7,
      "ast": 3.9,
      "stl": 0.6,
      "blk": 1.2,
      "fg3m": 1.4,
      "to": 2.9,
      "fantasyAvg": 45.9
    },
    "rank": 16,
    "adp": 16.2
  },
  {
    "id": "p33",
    "name": "James Harden",
    "team": "CLE",
    "teamName": "Cleveland Cavaliers",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3992.png",
    "seasonStats": {
      "pts": 23.6,
      "reb": 4.8,
      "ast": 8,
      "stl": 1.1,
      "blk": 0.4,
      "fg3m": 3.1,
      "to": 3.5,
      "fantasyAvg": 45.5
    },
    "rank": 17,
    "adp": 16.9
  },
  {
    "id": "p6",
    "name": "Anthony Davis",
    "team": "WAS",
    "teamName": "Washington Wizards",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6583.png",
    "seasonStats": {
      "pts": 20.4,
      "reb": 11.1,
      "ast": 2.8,
      "stl": 1.1,
      "blk": 1.7,
      "fg3m": 0.5,
      "to": 2.1,
      "fantasyAvg": 44.7
    },
    "rank": 18,
    "adp": 18.4
  },
  {
    "id": "p25",
    "name": "Alperen Şengün",
    "team": "HOU",
    "teamName": "Houston Rockets",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4871144.png",
    "seasonStats": {
      "pts": 20.4,
      "reb": 8.9,
      "ast": 6.2,
      "stl": 1.2,
      "blk": 1.1,
      "fg3m": 0.6,
      "to": 3.2,
      "fantasyAvg": 44.7
    },
    "rank": 19,
    "adp": 19.2
  },
  {
    "id": "p15",
    "name": "Tyrese Haliburton",
    "team": "IND",
    "teamName": "Indiana Pacers",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4396993.png",
    "seasonStats": {
      "pts": 18.6,
      "reb": 3.5,
      "ast": 9.2,
      "stl": 1.4,
      "blk": 0.7,
      "fg3m": 3,
      "to": 1.6,
      "fantasyAvg": 44.3
    },
    "rank": 20,
    "adp": 19.9
  },
  {
    "id": "p11",
    "name": "Kevin Durant",
    "team": "HOU",
    "teamName": "Houston Rockets",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3202.png",
    "seasonStats": {
      "pts": 26,
      "reb": 5.5,
      "ast": 4.8,
      "stl": 0.8,
      "blk": 0.9,
      "fg3m": 2.4,
      "to": 3.2,
      "fantasyAvg": 44.1
    },
    "rank": 21,
    "adp": 21.4
  },
  {
    "id": "p9",
    "name": "Stephen Curry",
    "team": "GSW",
    "teamName": "Golden State Warriors",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3975.png",
    "seasonStats": {
      "pts": 26.6,
      "reb": 3.6,
      "ast": 4.7,
      "stl": 1.1,
      "blk": 0.4,
      "fg3m": 4.4,
      "to": 2.8,
      "fantasyAvg": 44.1
    },
    "rank": 22,
    "adp": 22.2
  },
  {
    "id": "p42",
    "name": "Lauri Markkanen",
    "team": "UTA",
    "teamName": "Utah Jazz",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4066336.png",
    "seasonStats": {
      "pts": 26.7,
      "reb": 6.9,
      "ast": 2.1,
      "stl": 1,
      "blk": 0.5,
      "fg3m": 2.7,
      "to": 1.5,
      "fantasyAvg": 43.8
    },
    "rank": 23,
    "adp": 22.9
  },
  {
    "id": "p30",
    "name": "Kyrie Irving",
    "team": "DAL",
    "teamName": "Dallas Mavericks",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6442.png",
    "seasonStats": {
      "pts": 24.7,
      "reb": 4.8,
      "ast": 4.6,
      "stl": 1.3,
      "blk": 0.5,
      "fg3m": 2.9,
      "to": 2.2,
      "fantasyAvg": 43.5
    },
    "rank": 24,
    "adp": 24.4
  },
  {
    "id": "p66",
    "name": "Josh Giddey",
    "team": "CHI",
    "teamName": "Chicago Bulls",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4871145.png",
    "seasonStats": {
      "pts": 17,
      "reb": 8.3,
      "ast": 9.1,
      "stl": 1,
      "blk": 0.5,
      "fg3m": 1.9,
      "to": 3.6,
      "fantasyAvg": 43.4
    },
    "rank": 25,
    "adp": 25.2
  },
  {
    "id": "p18",
    "name": "Jalen Brunson",
    "team": "NYK",
    "teamName": "New York Knicks",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3934672.png",
    "seasonStats": {
      "pts": 26,
      "reb": 3.3,
      "ast": 6.8,
      "stl": 0.8,
      "blk": 0.1,
      "fg3m": 2.6,
      "to": 2.4,
      "fantasyAvg": 43.1
    },
    "rank": 26,
    "adp": 25.9
  },
  {
    "id": "p38",
    "name": "Scottie Barnes",
    "team": "TOR",
    "teamName": "Toronto Raptors",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4433134.png",
    "seasonStats": {
      "pts": 18.1,
      "reb": 7.5,
      "ast": 5.9,
      "stl": 1.4,
      "blk": 1.5,
      "fg3m": 0.9,
      "to": 2.6,
      "fantasyAvg": 43
    },
    "rank": 27,
    "adp": 27.4
  },
  {
    "id": "p16",
    "name": "LeBron James",
    "team": "PHI",
    "teamName": "Philadelphia 76ers",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/1966.png",
    "seasonStats": {
      "pts": 20.9,
      "reb": 6.1,
      "ast": 7.2,
      "stl": 1.2,
      "blk": 0.6,
      "fg3m": 1.3,
      "to": 3,
      "fantasyAvg": 42.7
    },
    "rank": 28,
    "adp": 28.2
  },
  {
    "id": "p22",
    "name": "Bam Adebayo",
    "team": "MIA",
    "teamName": "Miami Heat",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4066261.png",
    "seasonStats": {
      "pts": 20.1,
      "reb": 10,
      "ast": 3.2,
      "stl": 1.2,
      "blk": 0.7,
      "fg3m": 1.7,
      "to": 1.6,
      "fantasyAvg": 42.7
    },
    "rank": 29,
    "adp": 28.9
  },
  {
    "id": "p106",
    "name": "Michael Porter Jr.",
    "team": "BKN",
    "teamName": "Brooklyn Nets",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4278104.png",
    "seasonStats": {
      "pts": 24.2,
      "reb": 7.1,
      "ast": 3,
      "stl": 1.1,
      "blk": 0.3,
      "fg3m": 3.4,
      "to": 2.3,
      "fantasyAvg": 42.5
    },
    "rank": 30,
    "adp": 30.4
  },
  {
    "id": "p26",
    "name": "Paolo Banchero",
    "team": "ORL",
    "teamName": "Orlando Magic",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4432573.png",
    "seasonStats": {
      "pts": 22.2,
      "reb": 8.4,
      "ast": 5.2,
      "stl": 0.7,
      "blk": 0.6,
      "fg3m": 1.2,
      "to": 3.1,
      "fantasyAvg": 42.1
    },
    "rank": 31,
    "adp": 31.2
  },
  {
    "id": "p19",
    "name": "Karl-Anthony Towns",
    "team": "NYK",
    "teamName": "New York Knicks",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3136195.png",
    "seasonStats": {
      "pts": 20.1,
      "reb": 11.9,
      "ast": 3,
      "stl": 0.9,
      "blk": 0.5,
      "fg3m": 1.5,
      "to": 2.5,
      "fantasyAvg": 42.1
    },
    "rank": 32,
    "adp": 31.9
  },
  {
    "id": "p23",
    "name": "LaMelo Ball",
    "team": "MIN",
    "teamName": "Minnesota Timberwolves",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4432816.png",
    "seasonStats": {
      "pts": 20.1,
      "reb": 4.8,
      "ast": 7.1,
      "stl": 1.2,
      "blk": 0.3,
      "fg3m": 3.8,
      "to": 2.8,
      "fantasyAvg": 42
    },
    "rank": 33,
    "adp": 33.4
  },
  {
    "id": "p12",
    "name": "Devin Booker",
    "team": "PHX",
    "teamName": "Phoenix Suns",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3136193.png",
    "seasonStats": {
      "pts": 26.1,
      "reb": 3.9,
      "ast": 6,
      "stl": 0.8,
      "blk": 0.3,
      "fg3m": 1.9,
      "to": 3.1,
      "fantasyAvg": 41.9
    },
    "rank": 34,
    "adp": 34.2
  },
  {
    "id": "p35",
    "name": "Pascal Siakam",
    "team": "IND",
    "teamName": "Indiana Pacers",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3149673.png",
    "seasonStats": {
      "pts": 24,
      "reb": 6.6,
      "ast": 3.8,
      "stl": 1.1,
      "blk": 0.4,
      "fg3m": 1.7,
      "to": 2.2,
      "fantasyAvg": 41.6
    },
    "rank": 35,
    "adp": 34.9
  },
  {
    "id": "p129",
    "name": "Trey Murphy III",
    "team": "NOP",
    "teamName": "New Orleans Pelicans",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4397688.png",
    "seasonStats": {
      "pts": 21.5,
      "reb": 5.7,
      "ast": 3.8,
      "stl": 1.5,
      "blk": 0.4,
      "fg3m": 3.2,
      "to": 1.8,
      "fantasyAvg": 41.1
    },
    "rank": 36,
    "adp": 36.4
  },
  {
    "id": "p69",
    "name": "Austin Reaves",
    "team": "LAL",
    "teamName": "Los Angeles Lakers",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4066457.png",
    "seasonStats": {
      "pts": 23.3,
      "reb": 4.7,
      "ast": 5.5,
      "stl": 1.1,
      "blk": 0.4,
      "fg3m": 2.3,
      "to": 3,
      "fantasyAvg": 41
    },
    "rank": 37,
    "adp": 37.2
  },
  {
    "id": "p83",
    "name": "Keyonte George",
    "team": "UTA",
    "teamName": "Utah Jazz",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4433627.png",
    "seasonStats": {
      "pts": 23.6,
      "reb": 3.7,
      "ast": 6.1,
      "stl": 1.1,
      "blk": 0.3,
      "fg3m": 2.5,
      "to": 3.1,
      "fantasyAvg": 40.8
    },
    "rank": 38,
    "adp": 37.9
  },
  {
    "id": "p39",
    "name": "Evan Mobley",
    "team": "CLE",
    "teamName": "Cleveland Cavaliers",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4432158.png",
    "seasonStats": {
      "pts": 18.2,
      "reb": 9,
      "ast": 3.6,
      "stl": 0.7,
      "blk": 1.7,
      "fg3m": 1,
      "to": 1.9,
      "fantasyAvg": 40.7
    },
    "rank": 39,
    "adp": 39.4
  },
  {
    "id": "p95",
    "name": "Amen Thompson",
    "team": "HOU",
    "teamName": "Houston Rockets",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4684740.png",
    "seasonStats": {
      "pts": 18.3,
      "reb": 7.8,
      "ast": 5.3,
      "stl": 1.5,
      "blk": 0.6,
      "fg3m": 0.3,
      "to": 2.4,
      "fantasyAvg": 39.8
    },
    "rank": 40,
    "adp": 40.2
  },
  {
    "id": "p86",
    "name": "Walker Kessler",
    "team": "LAL",
    "teamName": "Los Angeles Lakers",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4433136.png",
    "seasonStats": {
      "pts": 14.4,
      "reb": 10.8,
      "ast": 3,
      "stl": 1.4,
      "blk": 1.8,
      "fg3m": 1.2,
      "to": 3.2,
      "fantasyAvg": 39.5
    },
    "rank": 41,
    "adp": 40.9
  },
  {
    "id": "p49",
    "name": "Julius Randle",
    "team": "BKN",
    "teamName": "Brooklyn Nets",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3064514.png",
    "seasonStats": {
      "pts": 21.1,
      "reb": 6.7,
      "ast": 5,
      "stl": 1.1,
      "blk": 0.2,
      "fg3m": 1.4,
      "to": 2.7,
      "fantasyAvg": 39.2
    },
    "rank": 42,
    "adp": 42.4
  },
  {
    "id": "p34",
    "name": "Jimmy Butler",
    "team": "GSW",
    "teamName": "Golden State Warriors",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6430.png",
    "seasonStats": {
      "pts": 20,
      "reb": 5.6,
      "ast": 4.9,
      "stl": 1.4,
      "blk": 0.2,
      "fg3m": 0.8,
      "to": 1.6,
      "fantasyAvg": 38.1
    },
    "rank": 43,
    "adp": 43.2
  },
  {
    "id": "p45",
    "name": "Derrick White",
    "team": "BOS",
    "teamName": "Boston Celtics",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3078576.png",
    "seasonStats": {
      "pts": 16.5,
      "reb": 4.4,
      "ast": 5.4,
      "stl": 1.1,
      "blk": 1.3,
      "fg3m": 2.7,
      "to": 1.7,
      "fantasyAvg": 38.1
    },
    "rank": 44,
    "adp": 43.9
  },
  {
    "id": "p111",
    "name": "Jalen Duren",
    "team": "DET",
    "teamName": "Detroit Pistons",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4433621.png",
    "seasonStats": {
      "pts": 19.5,
      "reb": 10.5,
      "ast": 2,
      "stl": 0.8,
      "blk": 0.8,
      "fg3m": 0,
      "to": 1.9,
      "fantasyAvg": 38
    },
    "rank": 45,
    "adp": 45.4
  },
  {
    "id": "p126",
    "name": "Brandon Ingram",
    "team": "LAC",
    "teamName": "LA Clippers",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3913176.png",
    "seasonStats": {
      "pts": 21.5,
      "reb": 5.6,
      "ast": 3.7,
      "stl": 0.8,
      "blk": 0.7,
      "fg3m": 1.8,
      "to": 2.4,
      "fantasyAvg": 37.7
    },
    "rank": 46,
    "adp": 46.2
  },
  {
    "id": "p24",
    "name": "Chet Holmgren",
    "team": "OKC",
    "teamName": "Oklahoma City Thunder",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4433255.png",
    "seasonStats": {
      "pts": 17.1,
      "reb": 8.9,
      "ast": 1.7,
      "stl": 0.6,
      "blk": 1.9,
      "fg3m": 1.3,
      "to": 1.6,
      "fantasyAvg": 37.5
    },
    "rank": 47,
    "adp": 46.9
  },
  {
    "id": "p27",
    "name": "Ja Morant",
    "team": "POR",
    "teamName": "Portland Trail Blazers",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4279888.png",
    "seasonStats": {
      "pts": 19.5,
      "reb": 3.3,
      "ast": 8.1,
      "stl": 1,
      "blk": 0.3,
      "fg3m": 1,
      "to": 3.6,
      "fantasyAvg": 36.9
    },
    "rank": 48,
    "adp": 48.4
  },
  {
    "id": "p82",
    "name": "Alex Sarr",
    "team": "WAS",
    "teamName": "Washington Wizards",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/5160992.png",
    "seasonStats": {
      "pts": 16.3,
      "reb": 7.4,
      "ast": 2.7,
      "stl": 0.8,
      "blk": 2,
      "fg3m": 1,
      "to": 1.7,
      "fantasyAvg": 36.9
    },
    "rank": 49,
    "adp": 49.2
  },
  {
    "id": "p60",
    "name": "Brandon Miller",
    "team": "CHA",
    "teamName": "Charlotte Hornets",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4433287.png",
    "seasonStats": {
      "pts": 20.2,
      "reb": 4.9,
      "ast": 3.3,
      "stl": 1,
      "blk": 0.7,
      "fg3m": 3.1,
      "to": 2.5,
      "fantasyAvg": 36.7
    },
    "rank": 50,
    "adp": 49.9
  },
  {
    "id": "p13",
    "name": "Domantas Sabonis",
    "team": "SAC",
    "teamName": "Sacramento Kings",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3155942.png",
    "seasonStats": {
      "pts": 15.8,
      "reb": 11.4,
      "ast": 4.1,
      "stl": 0.9,
      "blk": 0.2,
      "fg3m": 0.3,
      "to": 2.7,
      "fantasyAvg": 36.5
    },
    "rank": 51,
    "adp": 51.4
  },
  {
    "id": "p20",
    "name": "De'Aaron Fox",
    "team": "SAS",
    "teamName": "San Antonio Spurs",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4066259.png",
    "seasonStats": {
      "pts": 18.6,
      "reb": 3.8,
      "ast": 6.2,
      "stl": 1.2,
      "blk": 0.3,
      "fg3m": 1.8,
      "to": 2.3,
      "fantasyAvg": 36.5
    },
    "rank": 52,
    "adp": 52.2
  },
  {
    "id": "p31",
    "name": "Paul George",
    "team": "BOS",
    "teamName": "Boston Celtics",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4251.png",
    "seasonStats": {
      "pts": 17.3,
      "reb": 5.3,
      "ast": 3.6,
      "stl": 1.7,
      "blk": 0.4,
      "fg3m": 2.7,
      "to": 1.7,
      "fantasyAvg": 36.4
    },
    "rank": 53,
    "adp": 52.9
  },
  {
    "id": "p40",
    "name": "Jaren Jackson Jr.",
    "team": "UTA",
    "teamName": "Utah Jazz",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4277961.png",
    "seasonStats": {
      "pts": 19.4,
      "reb": 5.7,
      "ast": 2,
      "stl": 1.1,
      "blk": 1.4,
      "fg3m": 1.8,
      "to": 2.2,
      "fantasyAvg": 36.3
    },
    "rank": 54,
    "adp": 54.4
  },
  {
    "id": "p58",
    "name": "Tyler Herro",
    "team": "MIL",
    "teamName": "Milwaukee Bucks",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4395725.png",
    "seasonStats": {
      "pts": 20.5,
      "reb": 4.8,
      "ast": 4.1,
      "stl": 0.7,
      "blk": 0.4,
      "fg3m": 2.5,
      "to": 1.9,
      "fantasyAvg": 36.3
    },
    "rank": 55,
    "adp": 55.2
  },
  {
    "id": "p127",
    "name": "Dejounte Murray",
    "team": "NOP",
    "teamName": "New Orleans Pelicans",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3907497.png",
    "seasonStats": {
      "pts": 16.7,
      "reb": 5.4,
      "ast": 6.4,
      "stl": 1.6,
      "blk": 0.2,
      "fg3m": 1.4,
      "to": 3.4,
      "fantasyAvg": 36.2
    },
    "rank": 56,
    "adp": 55.9
  },
  {
    "id": "p52",
    "name": "Desmond Bane",
    "team": "ORL",
    "teamName": "Orlando Magic",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4066320.png",
    "seasonStats": {
      "pts": 20.1,
      "reb": 4.1,
      "ast": 4.1,
      "stl": 1,
      "blk": 0.5,
      "fg3m": 2,
      "to": 2,
      "fantasyAvg": 35.7
    },
    "rank": 57,
    "adp": 57.4
  },
  {
    "id": "p91",
    "name": "Immanuel Quickley",
    "team": "TOR",
    "teamName": "Toronto Raptors",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4395724.png",
    "seasonStats": {
      "pts": 16.4,
      "reb": 4,
      "ast": 5.9,
      "stl": 1.3,
      "blk": 0.1,
      "fg3m": 2.5,
      "to": 1.5,
      "fantasyAvg": 35.3
    },
    "rank": 58,
    "adp": 58.2
  },
  {
    "id": "p41",
    "name": "Zion Williamson",
    "team": "NOP",
    "teamName": "New Orleans Pelicans",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4395628.png",
    "seasonStats": {
      "pts": 21,
      "reb": 5.7,
      "ast": 3.2,
      "stl": 1,
      "blk": 0.5,
      "fg3m": 0,
      "to": 2,
      "fantasyAvg": 35.1
    },
    "rank": 59,
    "adp": 58.9
  },
  {
    "id": "p50",
    "name": "Franz Wagner",
    "team": "ORL",
    "teamName": "Orlando Magic",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4566434.png",
    "seasonStats": {
      "pts": 20.6,
      "reb": 5.2,
      "ast": 3.3,
      "stl": 0.9,
      "blk": 0.3,
      "fg3m": 1.4,
      "to": 1.7,
      "fantasyAvg": 35.1
    },
    "rank": 60,
    "adp": 60.4
  },
  {
    "id": "p46",
    "name": "Darius Garland",
    "team": "LAC",
    "teamName": "LA Clippers",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4396907.png",
    "seasonStats": {
      "pts": 18.8,
      "reb": 2.4,
      "ast": 6.7,
      "stl": 1,
      "blk": 0.2,
      "fg3m": 2.7,
      "to": 2.9,
      "fantasyAvg": 35.1
    },
    "rank": 61,
    "adp": 61.2
  },
  {
    "id": "p113",
    "name": "Dyson Daniels",
    "team": "ATL",
    "teamName": "Atlanta Hawks",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4869342.png",
    "seasonStats": {
      "pts": 11.9,
      "reb": 6.8,
      "ast": 5.9,
      "stl": 2,
      "blk": 0.4,
      "fg3m": 0.3,
      "to": 1.8,
      "fantasyAvg": 34.6
    },
    "rank": 62,
    "adp": 61.9
  },
  {
    "id": "p14",
    "name": "Trae Young",
    "team": "WAS",
    "teamName": "Washington Wizards",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4277905.png",
    "seasonStats": {
      "pts": 17.9,
      "reb": 2,
      "ast": 8,
      "stl": 0.9,
      "blk": 0.1,
      "fg3m": 1.8,
      "to": 2.6,
      "fantasyAvg": 34.5
    },
    "rank": 63,
    "adp": 63.4
  },
  {
    "id": "p100",
    "name": "Norman Powell",
    "team": "CHI",
    "teamName": "Chicago Bulls",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/2595516.png",
    "seasonStats": {
      "pts": 21.7,
      "reb": 3.5,
      "ast": 2.5,
      "stl": 1.1,
      "blk": 0.2,
      "fg3m": 2.7,
      "to": 1.9,
      "fantasyAvg": 34.4
    },
    "rank": 64,
    "adp": 64.2
  },
  {
    "id": "p124",
    "name": "Andrew Nembhard",
    "team": "IND",
    "teamName": "Indiana Pacers",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4395712.png",
    "seasonStats": {
      "pts": 16.9,
      "reb": 2.8,
      "ast": 7.7,
      "stl": 0.9,
      "blk": 0.1,
      "fg3m": 1.9,
      "to": 2.4,
      "fantasyAvg": 34.3
    },
    "rank": 65,
    "adp": 64.9
  },
  {
    "id": "p51",
    "name": "Jalen Williams",
    "team": "OKC",
    "teamName": "Oklahoma City Thunder",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4593803.png",
    "seasonStats": {
      "pts": 17.1,
      "reb": 4.6,
      "ast": 5.5,
      "stl": 1.2,
      "blk": 0.3,
      "fg3m": 0.7,
      "to": 1.9,
      "fantasyAvg": 34.2
    },
    "rank": 66,
    "adp": 66.4
  },
  {
    "id": "p59",
    "name": "Fred VanVleet",
    "team": "HOU",
    "teamName": "Houston Rockets",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/2991230.png",
    "seasonStats": {
      "pts": 14.1,
      "reb": 3.7,
      "ast": 5.6,
      "stl": 1.6,
      "blk": 0.4,
      "fg3m": 2.7,
      "to": 1.5,
      "fantasyAvg": 34.1
    },
    "rank": 67,
    "adp": 67.2
  },
  {
    "id": "p97",
    "name": "Jusuf Nurkić",
    "team": "UTA",
    "teamName": "Utah Jazz",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3102530.png",
    "seasonStats": {
      "pts": 10.9,
      "reb": 10.4,
      "ast": 4.8,
      "stl": 1.3,
      "blk": 0.5,
      "fg3m": 0.6,
      "to": 2.5,
      "fantasyAvg": 34.1
    },
    "rank": 68,
    "adp": 67.9
  },
  {
    "id": "p62",
    "name": "Jrue Holiday",
    "team": "POR",
    "teamName": "Portland Trail Blazers",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3995.png",
    "seasonStats": {
      "pts": 16.3,
      "reb": 4.6,
      "ast": 6.1,
      "stl": 1,
      "blk": 0.1,
      "fg3m": 2.6,
      "to": 2.8,
      "fantasyAvg": 34.1
    },
    "rank": 69,
    "adp": 69.4
  },
  {
    "id": "p67",
    "name": "Nikola Vučević",
    "team": "ORL",
    "teamName": "Orlando Magic",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6478.png",
    "seasonStats": {
      "pts": 15.1,
      "reb": 8.4,
      "ast": 3.3,
      "stl": 0.6,
      "blk": 0.6,
      "fg3m": 1.6,
      "to": 1.3,
      "fantasyAvg": 34
    },
    "rank": 70,
    "adp": 70.2
  },
  {
    "id": "p90",
    "name": "RJ Barrett",
    "team": "TOR",
    "teamName": "Toronto Raptors",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4395625.png",
    "seasonStats": {
      "pts": 19.3,
      "reb": 5.3,
      "ast": 3.3,
      "stl": 0.7,
      "blk": 0.3,
      "fg3m": 1.7,
      "to": 1.7,
      "fantasyAvg": 33.6
    },
    "rank": 71,
    "adp": 70.9
  },
  {
    "id": "p64",
    "name": "OG Anunoby",
    "team": "NYK",
    "teamName": "New York Knicks",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3934719.png",
    "seasonStats": {
      "pts": 16.7,
      "reb": 5.2,
      "ast": 2.2,
      "stl": 1.6,
      "blk": 0.7,
      "fg3m": 2.3,
      "to": 1.8,
      "fantasyAvg": 33.6
    },
    "rank": 72,
    "adp": 72.4
  },
  {
    "id": "p79",
    "name": "Shaedon Sharpe",
    "team": "POR",
    "teamName": "Portland Trail Blazers",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4914336.png",
    "seasonStats": {
      "pts": 20.8,
      "reb": 4.3,
      "ast": 2.6,
      "stl": 1.4,
      "blk": 0.1,
      "fg3m": 2.1,
      "to": 2.9,
      "fantasyAvg": 33.6
    },
    "rank": 73,
    "adp": 73.2
  },
  {
    "id": "p120",
    "name": "Jalen Suggs",
    "team": "ORL",
    "teamName": "Orlando Magic",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4432165.png",
    "seasonStats": {
      "pts": 13.8,
      "reb": 3.9,
      "ast": 5.5,
      "stl": 1.8,
      "blk": 0.7,
      "fg3m": 2.1,
      "to": 2.7,
      "fantasyAvg": 33.6
    },
    "rank": 74,
    "adp": 73.9
  },
  {
    "id": "p117",
    "name": "Terry Rozier",
    "team": "FA",
    "teamName": "Free Agent",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3078280.png",
    "seasonStats": {
      "pts": 16.4,
      "reb": 4.2,
      "ast": 4.6,
      "stl": 1,
      "blk": 0.3,
      "fg3m": 2.4,
      "to": 1.4,
      "fantasyAvg": 33.2
    },
    "rank": 75,
    "adp": 75.4
  },
  {
    "id": "p47",
    "name": "Rudy Gobert",
    "team": "MIN",
    "teamName": "Minnesota Timberwolves",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3032976.png",
    "seasonStats": {
      "pts": 10.9,
      "reb": 11.5,
      "ast": 1.7,
      "stl": 0.8,
      "blk": 1.6,
      "fg3m": 0,
      "to": 1.4,
      "fantasyAvg": 33.1
    },
    "rank": 76,
    "adp": 76.2
  },
  {
    "id": "p61",
    "name": "CJ McCollum",
    "team": "ATL",
    "teamName": "Atlanta Hawks",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/2490149.png",
    "seasonStats": {
      "pts": 18.7,
      "reb": 3.3,
      "ast": 3.9,
      "stl": 0.8,
      "blk": 0.5,
      "fg3m": 2.5,
      "to": 1.8,
      "fantasyAvg": 33.1
    },
    "rank": 77,
    "adp": 76.9
  },
  {
    "id": "p94",
    "name": "Jabari Smith Jr.",
    "team": "HOU",
    "teamName": "Houston Rockets",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4432639.png",
    "seasonStats": {
      "pts": 15.8,
      "reb": 6.9,
      "ast": 1.9,
      "stl": 0.7,
      "blk": 0.9,
      "fg3m": 2.3,
      "to": 1.4,
      "fantasyAvg": 32.6
    },
    "rank": 78,
    "adp": 78.4
  },
  {
    "id": "p63",
    "name": "Kristaps Porziņģis",
    "team": "GSW",
    "teamName": "Golden State Warriors",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3102531.png",
    "seasonStats": {
      "pts": 16.7,
      "reb": 5.2,
      "ast": 2.5,
      "stl": 0.6,
      "blk": 1.2,
      "fg3m": 1.7,
      "to": 1.3,
      "fantasyAvg": 32.5
    },
    "rank": 79,
    "adp": 79.2
  },
  {
    "id": "p57",
    "name": "Miles Bridges",
    "team": "PHX",
    "teamName": "Phoenix Suns",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4066383.png",
    "seasonStats": {
      "pts": 17.1,
      "reb": 5.8,
      "ast": 3.2,
      "stl": 0.6,
      "blk": 0.4,
      "fg3m": 1.9,
      "to": 1.4,
      "fantasyAvg": 32.4
    },
    "rank": 80,
    "adp": 79.9
  },
  {
    "id": "p48",
    "name": "Jarrett Allen",
    "team": "CLE",
    "teamName": "Cleveland Cavaliers",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4066328.png",
    "seasonStats": {
      "pts": 15.4,
      "reb": 8.5,
      "ast": 1.8,
      "stl": 1,
      "blk": 0.8,
      "fg3m": 0,
      "to": 1.3,
      "fantasyAvg": 32.4
    },
    "rank": 81,
    "adp": 81.4
  },
  {
    "id": "p98",
    "name": "Grayson Allen",
    "team": "CHA",
    "teamName": "Charlotte Hornets",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3135045.png",
    "seasonStats": {
      "pts": 16.5,
      "reb": 3,
      "ast": 3.8,
      "stl": 1.4,
      "blk": 0.3,
      "fg3m": 3.1,
      "to": 1.6,
      "fantasyAvg": 32.4
    },
    "rank": 82,
    "adp": 82.2
  },
  {
    "id": "p99",
    "name": "Ivica Zubac",
    "team": "IND",
    "teamName": "Indiana Pacers",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4017837.png",
    "seasonStats": {
      "pts": 14.1,
      "reb": 10.6,
      "ast": 2.2,
      "stl": 0.4,
      "blk": 0.8,
      "fg3m": 0,
      "to": 1.8,
      "fantasyAvg": 31.9
    },
    "rank": 83,
    "adp": 82.9
  },
  {
    "id": "p43",
    "name": "Mikal Bridges",
    "team": "NYK",
    "teamName": "New York Knicks",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3147657.png",
    "seasonStats": {
      "pts": 14.4,
      "reb": 3.8,
      "ast": 3.7,
      "stl": 1.3,
      "blk": 0.8,
      "fg3m": 1.9,
      "to": 1,
      "fantasyAvg": 31.7
    },
    "rank": 84,
    "adp": 84.4
  },
  {
    "id": "p54",
    "name": "DeMar DeRozan",
    "team": "DEN",
    "teamName": "Denver Nuggets",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3978.png",
    "seasonStats": {
      "pts": 18.4,
      "reb": 2.9,
      "ast": 4.1,
      "stl": 1,
      "blk": 0.3,
      "fg3m": 0.6,
      "to": 1.2,
      "fantasyAvg": 31.3
    },
    "rank": 85,
    "adp": 85.2
  },
  {
    "id": "p102",
    "name": "P.J. Washington",
    "team": "DAL",
    "teamName": "Dallas Mavericks",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4278078.png",
    "seasonStats": {
      "pts": 14.2,
      "reb": 7,
      "ast": 1.8,
      "stl": 1,
      "blk": 1.1,
      "fg3m": 1.4,
      "to": 1.7,
      "fantasyAvg": 31.3
    },
    "rank": 86,
    "adp": 85.9
  },
  {
    "id": "p105",
    "name": "Aaron Gordon",
    "team": "DEN",
    "teamName": "Denver Nuggets",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3064290.png",
    "seasonStats": {
      "pts": 16.2,
      "reb": 5.8,
      "ast": 2.7,
      "stl": 0.6,
      "blk": 0.3,
      "fg3m": 1.7,
      "to": 1.1,
      "fantasyAvg": 30.5
    },
    "rank": 87,
    "adp": 87.4
  },
  {
    "id": "p93",
    "name": "Jalen Green",
    "team": "PHX",
    "teamName": "Phoenix Suns",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4437244.png",
    "seasonStats": {
      "pts": 17.8,
      "reb": 3.6,
      "ast": 2.8,
      "stl": 1.1,
      "blk": 0.3,
      "fg3m": 2.2,
      "to": 2.3,
      "fantasyAvg": 30.4
    },
    "rank": 88,
    "adp": 88.2
  },
  {
    "id": "p78",
    "name": "Jerami Grant",
    "team": "MEM",
    "teamName": "Memphis Grizzlies",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/2991070.png",
    "seasonStats": {
      "pts": 18.6,
      "reb": 3.5,
      "ast": 2.1,
      "stl": 0.7,
      "blk": 0.6,
      "fg3m": 2.4,
      "to": 2.1,
      "fantasyAvg": 30.2
    },
    "rank": 89,
    "adp": 88.9
  },
  {
    "id": "p118",
    "name": "Jaime Jaquez Jr.",
    "team": "MIL",
    "teamName": "Milwaukee Bucks",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4432848.png",
    "seasonStats": {
      "pts": 15.4,
      "reb": 5,
      "ast": 4.7,
      "stl": 0.7,
      "blk": 0.3,
      "fg3m": 0.8,
      "to": 2,
      "fantasyAvg": 30.2
    },
    "rank": 90,
    "adp": 90.4
  },
  {
    "id": "p123",
    "name": "Bennedict Mathurin",
    "team": "NOP",
    "teamName": "New Orleans Pelicans",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4683634.png",
    "seasonStats": {
      "pts": 17.6,
      "reb": 5.4,
      "ast": 2.4,
      "stl": 0.8,
      "blk": 0.2,
      "fg3m": 1.4,
      "to": 2.2,
      "fantasyAvg": 29.9
    },
    "rank": 91,
    "adp": 91.2
  },
  {
    "id": "p68",
    "name": "Zach LaVine",
    "team": "SAC",
    "teamName": "Sacramento Kings",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3064440.png",
    "seasonStats": {
      "pts": 19.2,
      "reb": 2.8,
      "ast": 2.3,
      "stl": 0.7,
      "blk": 0.3,
      "fg3m": 2.5,
      "to": 1.9,
      "fantasyAvg": 29.6
    },
    "rank": 92,
    "adp": 91.9
  },
  {
    "id": "p87",
    "name": "Nic Claxton",
    "team": "CHI",
    "teamName": "Chicago Bulls",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4278067.png",
    "seasonStats": {
      "pts": 11.7,
      "reb": 6.9,
      "ast": 3.7,
      "stl": 0.7,
      "blk": 1.1,
      "fg3m": 0,
      "to": 1.4,
      "fantasyAvg": 29.5
    },
    "rank": 93,
    "adp": 93.4
  },
  {
    "id": "p55",
    "name": "Coby White",
    "team": "CHA",
    "teamName": "Charlotte Hornets",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4395651.png",
    "seasonStats": {
      "pts": 17.4,
      "reb": 3.4,
      "ast": 4,
      "stl": 0.5,
      "blk": 0.1,
      "fg3m": 2.3,
      "to": 2.6,
      "fantasyAvg": 29
    },
    "rank": 94,
    "adp": 94.2
  },
  {
    "id": "p53",
    "name": "Myles Turner",
    "team": "MIL",
    "teamName": "Milwaukee Bucks",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3133628.png",
    "seasonStats": {
      "pts": 11.9,
      "reb": 5.3,
      "ast": 1.5,
      "stl": 0.7,
      "blk": 1.6,
      "fg3m": 2.1,
      "to": 1.2,
      "fantasyAvg": 28.3
    },
    "rank": 95,
    "adp": 94.9
  },
  {
    "id": "p74",
    "name": "Devin Vassell",
    "team": "SAS",
    "teamName": "San Antonio Spurs",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4395630.png",
    "seasonStats": {
      "pts": 13.9,
      "reb": 4,
      "ast": 2.5,
      "stl": 0.9,
      "blk": 0.4,
      "fg3m": 2.5,
      "to": 0.9,
      "fantasyAvg": 28
    },
    "rank": 96,
    "adp": 96.4
  },
  {
    "id": "p121",
    "name": "Wendell Carter Jr.",
    "team": "ORL",
    "teamName": "Orlando Magic",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4277847.png",
    "seasonStats": {
      "pts": 11.8,
      "reb": 7.4,
      "ast": 2,
      "stl": 0.8,
      "blk": 0.6,
      "fg3m": 0.9,
      "to": 1.3,
      "fantasyAvg": 27.5
    },
    "rank": 97,
    "adp": 97.2
  },
  {
    "id": "p112",
    "name": "Tobias Harris",
    "team": "SAS",
    "teamName": "San Antonio Spurs",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6440.png",
    "seasonStats": {
      "pts": 13.3,
      "reb": 5.1,
      "ast": 2.5,
      "stl": 0.9,
      "blk": 0.4,
      "fg3m": 1.3,
      "to": 1,
      "fantasyAvg": 27.4
    },
    "rank": 98,
    "adp": 97.9
  },
  {
    "id": "p109",
    "name": "Bobby Portis",
    "team": "MIA",
    "teamName": "Miami Heat",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3064482.png",
    "seasonStats": {
      "pts": 13.7,
      "reb": 6.4,
      "ast": 1.6,
      "stl": 0.6,
      "blk": 0.2,
      "fg3m": 2,
      "to": 1,
      "fantasyAvg": 27.2
    },
    "rank": 99,
    "adp": 99.4
  },
  {
    "id": "p76",
    "name": "Deandre Ayton",
    "team": "WAS",
    "teamName": "Washington Wizards",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4278129.png",
    "seasonStats": {
      "pts": 12.5,
      "reb": 8,
      "ast": 0.8,
      "stl": 0.6,
      "blk": 1,
      "fg3m": 0,
      "to": 1.2,
      "fantasyAvg": 26.9
    },
    "rank": 100,
    "adp": 100.2
  },
  {
    "id": "p71",
    "name": "Draymond Green",
    "team": "GSW",
    "teamName": "Golden State Warriors",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6589.png",
    "seasonStats": {
      "pts": 8.4,
      "reb": 5.5,
      "ast": 5.5,
      "stl": 0.9,
      "blk": 0.6,
      "fg3m": 1.5,
      "to": 2.7,
      "fantasyAvg": 26.6
    },
    "rank": 101,
    "adp": 100.9
  },
  {
    "id": "p84",
    "name": "Collin Sexton",
    "team": "LAL",
    "teamName": "Los Angeles Lakers",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4277811.png",
    "seasonStats": {
      "pts": 15.4,
      "reb": 2.3,
      "ast": 3.3,
      "stl": 1.1,
      "blk": 0.1,
      "fg3m": 1.6,
      "to": 2.1,
      "fantasyAvg": 26.2
    },
    "rank": 102,
    "adp": 102.4
  },
  {
    "id": "p85",
    "name": "John Collins",
    "team": "DET",
    "teamName": "Detroit Pistons",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3908845.png",
    "seasonStats": {
      "pts": 13.6,
      "reb": 5.3,
      "ast": 1,
      "stl": 0.9,
      "blk": 0.7,
      "fg3m": 1.3,
      "to": 1.4,
      "fantasyAvg": 26.2
    },
    "rank": 103,
    "adp": 103.2
  },
  {
    "id": "p125",
    "name": "Aaron Nesmith",
    "team": "IND",
    "teamName": "Indiana Pacers",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4396909.png",
    "seasonStats": {
      "pts": 13.8,
      "reb": 4.2,
      "ast": 1.9,
      "stl": 0.6,
      "blk": 0.5,
      "fg3m": 2.3,
      "to": 1.4,
      "fantasyAvg": 25.9
    },
    "rank": 104,
    "adp": 103.9
  },
  {
    "id": "p92",
    "name": "Jakob Poeltl",
    "team": "TOR",
    "teamName": "Toronto Raptors",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3134908.png",
    "seasonStats": {
      "pts": 10.7,
      "reb": 7,
      "ast": 2,
      "stl": 0.9,
      "blk": 0.7,
      "fg3m": 0,
      "to": 1.2,
      "fantasyAvg": 25.7
    },
    "rank": 105,
    "adp": 105.4
  },
  {
    "id": "p65",
    "name": "Kyle Kuzma",
    "team": "MIL",
    "teamName": "Milwaukee Bucks",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3134907.png",
    "seasonStats": {
      "pts": 13,
      "reb": 4.5,
      "ast": 2.7,
      "stl": 0.7,
      "blk": 0.4,
      "fg3m": 1.2,
      "to": 1.7,
      "fantasyAvg": 25.2
    },
    "rank": 106,
    "adp": 106.2
  },
  {
    "id": "p89",
    "name": "Cameron Johnson",
    "team": "DEN",
    "teamName": "Denver Nuggets",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3138196.png",
    "seasonStats": {
      "pts": 12.2,
      "reb": 3.8,
      "ast": 2.4,
      "stl": 0.7,
      "blk": 0.4,
      "fg3m": 2,
      "to": 0.9,
      "fantasyAvg": 24.8
    },
    "rank": 107,
    "adp": 106.9
  },
  {
    "id": "p103",
    "name": "Daniel Gafford",
    "team": "DAL",
    "teamName": "Dallas Mavericks",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4278049.png",
    "seasonStats": {
      "pts": 9.5,
      "reb": 6.9,
      "ast": 1.1,
      "stl": 0.8,
      "blk": 1.3,
      "fg3m": 0,
      "to": 1.1,
      "fantasyAvg": 24.6
    },
    "rank": 108,
    "adp": 108.4
  },
  {
    "id": "p77",
    "name": "Anfernee Simons",
    "team": "PHI",
    "teamName": "Philadelphia 76ers",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4351851.png",
    "seasonStats": {
      "pts": 14.3,
      "reb": 2.5,
      "ast": 2.4,
      "stl": 0.5,
      "blk": 0.1,
      "fg3m": 2.7,
      "to": 1.2,
      "fantasyAvg": 24.2
    },
    "rank": 109,
    "adp": 109.2
  },
  {
    "id": "p80",
    "name": "Jordan Poole",
    "team": "NOP",
    "teamName": "New Orleans Pelicans",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4277956.png",
    "seasonStats": {
      "pts": 13.4,
      "reb": 2,
      "ast": 3.1,
      "stl": 0.6,
      "blk": 0.4,
      "fg3m": 2.5,
      "to": 1.8,
      "fantasyAvg": 24.2
    },
    "rank": 110,
    "adp": 109.9
  },
  {
    "id": "p72",
    "name": "Jonathan Kuminga",
    "team": "MIN",
    "teamName": "Minnesota Timberwolves",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4433247.png",
    "seasonStats": {
      "pts": 12.2,
      "reb": 5.6,
      "ast": 2.3,
      "stl": 0.6,
      "blk": 0.3,
      "fg3m": 1,
      "to": 1.9,
      "fantasyAvg": 24.2
    },
    "rank": 111,
    "adp": 111.4
  },
  {
    "id": "p88",
    "name": "Dennis Schröder",
    "team": "CHA",
    "teamName": "Charlotte Hornets",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3032979.png",
    "seasonStats": {
      "pts": 10.8,
      "reb": 2.7,
      "ast": 4.9,
      "stl": 0.8,
      "blk": 0.2,
      "fg3m": 1.1,
      "to": 1.8,
      "fantasyAvg": 23.7
    },
    "rank": 112,
    "adp": 112.2
  },
  {
    "id": "p128",
    "name": "Herbert Jones",
    "team": "NOP",
    "teamName": "New Orleans Pelicans",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4277813.png",
    "seasonStats": {
      "pts": 8.9,
      "reb": 3.4,
      "ast": 2.8,
      "stl": 1.6,
      "blk": 0.5,
      "fg3m": 1.4,
      "to": 1.3,
      "fantasyAvg": 23.6
    },
    "rank": 113,
    "adp": 112.9
  },
  {
    "id": "p108",
    "name": "Brook Lopez",
    "team": "LAC",
    "teamName": "LA Clippers",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3448.png",
    "seasonStats": {
      "pts": 8.5,
      "reb": 3.6,
      "ast": 1.3,
      "stl": 0.6,
      "blk": 1.2,
      "fg3m": 1.5,
      "to": 0.8,
      "fantasyAvg": 20.9
    },
    "rank": 114,
    "adp": 114.4
  },
  {
    "id": "p101",
    "name": "Klay Thompson",
    "team": "MIA",
    "teamName": "Miami Heat",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6475.png",
    "seasonStats": {
      "pts": 11.7,
      "reb": 2.1,
      "ast": 1.4,
      "stl": 0.5,
      "blk": 0.3,
      "fg3m": 2.9,
      "to": 0.9,
      "fantasyAvg": 20.7
    },
    "rank": 115,
    "adp": 115.2
  },
  {
    "id": "p107",
    "name": "Khris Middleton",
    "team": "WAS",
    "teamName": "Washington Wizards",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6609.png",
    "seasonStats": {
      "pts": 10.2,
      "reb": 3.7,
      "ast": 2.8,
      "stl": 0.7,
      "blk": 0.1,
      "fg3m": 1.1,
      "to": 1.7,
      "fantasyAvg": 20.6
    },
    "rank": 116,
    "adp": 115.9
  },
  {
    "id": "p116",
    "name": "Zaccharie Risacher",
    "team": "DAL",
    "teamName": "Dallas Mavericks",
    "position": "SF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/5211175.png",
    "seasonStats": {
      "pts": 9.6,
      "reb": 3.8,
      "ast": 1.1,
      "stl": 0.9,
      "blk": 0.5,
      "fg3m": 1.4,
      "to": 0.9,
      "fantasyAvg": 20.5
    },
    "rank": 117,
    "adp": 117.4
  },
  {
    "id": "p70",
    "name": "D'Angelo Russell",
    "team": "MEM",
    "teamName": "Memphis Grizzlies",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3136776.png",
    "seasonStats": {
      "pts": 10.2,
      "reb": 2.3,
      "ast": 4,
      "stl": 0.5,
      "blk": 0.1,
      "fg3m": 1.3,
      "to": 1.9,
      "fantasyAvg": 20.2
    },
    "rank": 118,
    "adp": 118.2
  },
  {
    "id": "p56",
    "name": "Cam Thomas",
    "team": "GSW",
    "teamName": "Golden State Warriors",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4432174.png",
    "seasonStats": {
      "pts": 13.5,
      "reb": 1.7,
      "ast": 2.6,
      "stl": 0.2,
      "blk": 0.1,
      "fg3m": 1.2,
      "to": 1.8,
      "fantasyAvg": 19.7
    },
    "rank": 119,
    "adp": 118.9
  },
  {
    "id": "p104",
    "name": "Dereck Lively II",
    "team": "DAL",
    "teamName": "Dallas Mavericks",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4683688.png",
    "seasonStats": {
      "pts": 4.3,
      "reb": 5.3,
      "ast": 1.9,
      "stl": 0.6,
      "blk": 1.6,
      "fg3m": 0,
      "to": 1.4,
      "fantasyAvg": 18.7
    },
    "rank": 120,
    "adp": 120.4
  },
  {
    "id": "p122",
    "name": "Kentavious Caldwell-Pope",
    "team": "PHI",
    "teamName": "Philadelphia 76ers",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/2581018.png",
    "seasonStats": {
      "pts": 8.4,
      "reb": 2.5,
      "ast": 2.7,
      "stl": 0.8,
      "blk": 0.2,
      "fg3m": 1.1,
      "to": 1.2,
      "fantasyAvg": 18.4
    },
    "rank": 121,
    "adp": 121.2
  },
  {
    "id": "p81",
    "name": "Jonas Valančiūnas",
    "team": "FA",
    "teamName": "Free Agent",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6477.png",
    "seasonStats": {
      "pts": 8.7,
      "reb": 5.1,
      "ast": 1.2,
      "stl": 0.2,
      "blk": 0.6,
      "fg3m": 0.1,
      "to": 1.1,
      "fantasyAvg": 18
    },
    "rank": 122,
    "adp": 121.9
  },
  {
    "id": "p110",
    "name": "Jaden Ivey",
    "team": "FA",
    "teamName": "Free Agent",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4433218.png",
    "seasonStats": {
      "pts": 8.5,
      "reb": 2.5,
      "ast": 1.8,
      "stl": 0.6,
      "blk": 0.4,
      "fg3m": 1.4,
      "to": 1.1,
      "fantasyAvg": 17.5
    },
    "rank": 123,
    "adp": 123.4
  },
  {
    "id": "p119",
    "name": "Nikola Jović",
    "team": "MIA",
    "teamName": "Miami Heat",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4997528.png",
    "seasonStats": {
      "pts": 7.3,
      "reb": 3.3,
      "ast": 2.2,
      "stl": 0.6,
      "blk": 0.4,
      "fg3m": 1,
      "to": 1.4,
      "fantasyAvg": 17.2
    },
    "rank": 124,
    "adp": 124.2
  },
  {
    "id": "p115",
    "name": "Bogdan Bogdanović",
    "team": "HOU",
    "teamName": "Houston Rockets",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3037789.png",
    "seasonStats": {
      "pts": 7.4,
      "reb": 2.6,
      "ast": 2.2,
      "stl": 0.4,
      "blk": 0.1,
      "fg3m": 1.4,
      "to": 1.2,
      "fantasyAvg": 15.5
    },
    "rank": 125,
    "adp": 124.9
  },
  {
    "id": "p114",
    "name": "Clint Capela",
    "team": "HOU",
    "teamName": "Houston Rockets",
    "position": "C",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/3102529.png",
    "seasonStats": {
      "pts": 3.8,
      "reb": 4.6,
      "ast": 0.7,
      "stl": 0.5,
      "blk": 0.8,
      "fg3m": 0,
      "to": 0.5,
      "fantasyAvg": 13.8
    },
    "rank": 126,
    "adp": 126.4
  },
  {
    "id": "p96",
    "name": "Bradley Beal",
    "team": "LAC",
    "teamName": "LA Clippers",
    "position": "SG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/6580.png",
    "seasonStats": {
      "pts": 8.2,
      "reb": 0.8,
      "ast": 1.7,
      "stl": 0.5,
      "blk": 0,
      "fg3m": 1.2,
      "to": 1.5,
      "fantasyAvg": 12.9
    },
    "rank": 127,
    "adp": 127.2
  },
  {
    "id": "p73",
    "name": "Chris Paul",
    "team": "FA",
    "teamName": "Free Agent",
    "position": "PG",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/2779.png",
    "seasonStats": {
      "pts": 2.9,
      "reb": 1.8,
      "ast": 3.3,
      "stl": 0.7,
      "blk": 0,
      "fg3m": 0.6,
      "to": 1,
      "fantasyAvg": 11.7
    },
    "rank": 128,
    "adp": 127.9
  },
  {
    "id": "p75",
    "name": "Jeremy Sochan",
    "team": "POR",
    "teamName": "Portland Trail Blazers",
    "position": "PF",
    "avatarUrl": "https://a.espncdn.com/i/headshots/nba/players/full/4610139.png",
    "seasonStats": {
      "pts": 3.6,
      "reb": 2.4,
      "ast": 0.9,
      "stl": 0.4,
      "blk": 0.2,
      "fg3m": 0.3,
      "to": 0.5,
      "fantasyAvg": 9.4
    },
    "rank": 129,
    "adp": 129.4
  }
];
