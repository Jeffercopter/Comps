export const LOGO = String.raw`
 ██╗    ██╗██╗  ██╗██╗████████╗███╗   ███╗ ██████╗ ██████╗ ███████╗
 ██║    ██║██║  ██║██║╚══██╔══╝████╗ ████║██╔═══██╗██╔══██╗██╔════╝
 ██║ █╗ ██║███████║██║   ██║   ██╔████╔██║██║   ██║██████╔╝█████╗
 ██║███╗██║██╔══██║██║   ██║   ██║╚██╔╝██║██║   ██║██╔══██╗██╔══╝
 ╚███╔███╔╝██║  ██║██║   ██║   ██║ ╚═╝ ██║╚██████╔╝██║  ██║███████╗
  ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝   ╚═╝   ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
        A U S T R A L I A   ·   D I S T R I B U T O R S H I P
`

export const DRAGLINE = String.raw`
                                              /|
                                            /  |
                                          /    |
                                        /      |   hoist rope
                                      /  BOOM  |
                                    /          |
                                  /            O   sheave
                                /              |\
                              /                | \
                            /                  |  \   drag rope
      +--------------------+                   |   \
      | ###  machinery ### |              +----+----+
      | ###    house   ### |              |### BUCKET|
      +--------------------+              +--\_____/-+
      | o o  swing rack  o |
      +--+--------------+--+
   #####+##############+########
   ###########  TUB  ###########
  ============================================
`

export const LUBE_POINTS: { point: string; product: string; slug: string }[] = [
  { point: 'Open gears / swing rack', product: 'Surtac® 2000', slug: 'surtac-2000' },
  { point: 'Severe exposed gearing', product: 'GearMate® 1000 ICT', slug: 'gearmate-1000' },
  { point: 'Hoist & drag ropes', product: 'Drag Rope Lubricant HF', slug: 'drag-rope-lubricant-hf' },
  { point: 'Hoist / drag / swing gearbox', product: 'Decathlon® Extreme', slug: 'decathlon-extreme' },
  { point: 'Auto-lube circuit', product: 'Caliber™ 3M / 5M', slug: 'caliber-3m-5m' },
  { point: 'Boom point (cold start)', product: 'Legacy™ M', slug: 'legacy-m' },
  { point: 'House rails & rollers', product: 'Surtac® 2000 HD', slug: 'surtac-2000' },
  { point: 'Slide boxes (Bucyrus 2500)', product: 'WhitSlide® Extreme', slug: 'whitslide-extreme' },
]

export const MAP_AU = String.raw`
                     _.--._        _.-._
               _..--'      '-.__.-'      '-._
           .-''                               '-.
         .'          * PILBARA                    '.
        /             grinding        * BOWEN BASIN \
       |              circuits          draglines    |
       |                                 shovels     |
       |     * PERTH                    * MACKAY     |
       |       WA base                    QLD base   |
        \                            * HUNTER VALLEY/
         '-.                            draglines .'
            '-._        * NEWCASTLE          _.-'
                '--.._      NSW base    _..--'
                      ''----.____.----''
`
