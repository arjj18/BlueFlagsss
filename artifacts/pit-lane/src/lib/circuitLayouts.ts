// Simplified SVG circuit layout outlines for F1 circuits.
// Paths represent the approximate track centerline, not exact GPS traces.
// Each path fits within the declared viewBox.
// All circuits share the same rendering component (CircuitSilhouette).

export interface CircuitLayout {
  viewBox: string;
  d: string; // SVG path data
}

export const CIRCUIT_LAYOUTS: Record<string, CircuitLayout> = {

  // ── Street circuits ───────────────────────────────────────────────────────

  Monaco: {
    viewBox: "0 0 200 160",
    // Compact clockwise layout: pit straight, climb to Casino, Fairmont hairpin,
    // Portier, tunnel, Swimming Pool, Rascasse, Anthony Noghes
    d: `M 22,140 L 78,140 L 82,125 L 82,98
        Q 82,86 94,80 L 114,73 Q 126,69 128,57
        L 128,36 Q 128,24 140,22 L 158,22
        Q 170,22 172,34 Q 174,46 165,54
        L 153,60 Q 143,65 140,76 L 140,94
        Q 140,106 152,107 L 178,107
        Q 186,107 186,99 L 186,79
        Q 186,70 177,70 L 165,70
        Q 156,70 153,79 L 152,90
        Q 151,99 143,99 L 132,99
        Q 120,99 116,109 L 114,140 Z`,
  },

  Singapore: {
    viewBox: "0 0 200 160",
    // Rectangular street circuit: long straights on two sides, complex middle section
    d: `M 15,140 L 15,90 Q 15,80 22,78
        L 50,70 L 50,50 Q 50,40 60,38
        L 100,38 Q 108,38 110,46
        L 112,60 L 130,60 L 130,50
        Q 130,40 140,38 L 165,38
        Q 175,38 178,48 L 178,80
        Q 178,90 168,92 L 150,94
        L 150,115 Q 150,125 140,128
        L 80,128 Q 70,128 68,118
        L 68,98 Q 68,88 58,86
        L 30,84 Q 20,82 22,72
        L 22,52 Q 22,44 15,42
        L 8,40 Q 3,38 5,32
        L 5,15 Q 5,5 15,4
        L 35,4 Q 45,4 45,14
        L 42,30 L 50,30 L 50,20
        Q 50,10 60,10 L 80,10
        Q 90,10 90,20 L 90,30
        L 110,30 L 110,26
        Q 112,16 122,16 L 140,16
        Q 150,16 150,26 L 150,38 Z`,
  },

  Baku: {
    viewBox: "0 0 200 160",
    // Very long main straight (right side), then tight city section at top-left
    d: `M 178,15 L 178,130 Q 178,140 168,140
        L 20,140 Q 10,140 10,130
        L 10,118 Q 10,108 20,108
        L 38,108 Q 46,108 48,100
        L 52,80 Q 54,72 62,70
        L 80,68 Q 88,66 90,58
        L 90,46 Q 90,36 100,34
        L 130,30 Q 140,28 142,20
        L 144,10 Q 145,3 152,3
        L 170,3 Q 178,3 178,12 Z`,
  },

  Jeddah: {
    viewBox: "0 0 200 160",
    // Very fast, flowing street circuit with long sweeping corners
    d: `M 30,150 L 30,120 Q 30,110 42,106
        L 60,100 Q 70,96 72,86
        L 75,65 Q 76,56 84,52
        L 100,46 Q 110,42 112,32
        L 116,14 Q 118,6 128,5
        L 165,5 Q 175,5 177,15
        L 178,30 Q 179,40 170,43
        L 158,46 Q 148,48 148,58
        L 148,80 Q 148,90 158,92
        L 172,94 Q 180,96 180,106
        L 180,140 Q 180,150 170,150 Z`,
  },

  // ── High-speed circuits ───────────────────────────────────────────────────

  Monza: {
    viewBox: "0 0 200 160",
    // Large sweeping oval with two chicane protrusions cutting inward
    d: `M 100,12 Q 145,12 165,35 Q 185,58 185,80
        Q 185,110 165,128 Q 145,146 100,146
        Q 55,146 35,128 Q 15,110 15,80
        Q 15,50 35,30 Q 55,12 100,12 Z
        M 58,80 L 75,65 L 75,80 L 58,80 Z
        M 130,100 L 148,85 L 148,100 L 130,100 Z`,
  },

  Spa: {
    viewBox: "0 0 200 160",
    // Long elongated circuit: Kemmel straight top, La Source hairpin right,
    // Eau Rouge kink bottom-right, Bus Stop chicane top-left
    d: `M 40,30 L 140,10 Q 165,6 175,22
        L 185,40 Q 192,56 180,65
        L 162,72 Q 150,76 148,90
        Q 146,104 155,114 L 160,124
        Q 165,134 155,140 L 80,150
        Q 65,152 58,140 L 50,125
        Q 42,110 55,102 L 72,96
        Q 84,90 84,77 L 82,62
        Q 80,50 68,44 L 46,38
        Q 32,34 40,22 Q 45,14 55,12
        L 40,30 Z`,
  },

  Silverstone: {
    viewBox: "0 0 200 160",
    // Roughly triangular with complex Wing complex (Maggots/Becketts) at top
    d: `M 95,10 L 155,10 Q 168,10 172,22
        L 185,55 Q 190,68 182,78
        L 165,90 Q 155,96 155,108
        L 155,128 Q 155,140 143,140
        L 75,140 Q 62,140 58,128
        L 52,108 Q 48,96 36,90
        L 20,80 Q 10,70 16,56
        L 28,28 Q 34,16 48,12
        L 70,10 L 85,20 Q 90,26 95,20
        Q 100,14 108,12 L 128,10
        Q 120,20 115,32 L 100,44
        Q 88,55 95,65 L 108,75
        Q 118,82 125,72 L 135,58
        Q 142,46 135,36 L 95,10 Z`,
  },

  Suzuka: {
    viewBox: "0 0 200 160",
    // Unique figure-8 with crossover (underpass) in the middle
    d: `M 100,8 Q 140,8 162,28 Q 184,48 184,78
        Q 184,104 168,120 L 155,132
        Q 142,142 126,140 L 115,136
        Q 104,130 104,118 L 104,102
        Q 104,90 96,90 L 88,90
        Q 80,90 80,102 L 80,118
        Q 80,130 68,136 L 56,140
        Q 40,142 26,130 L 14,118
        Q 2,104 4,78
        Q 6,52 26,34 Q 46,16 74,12
        L 82,10 Q 90,8 96,14 L 100,22
        Q 104,30 100,38 L 92,50
        Q 86,58 82,70 L 95,80
        Q 100,84 104,78 L 112,65
        Q 118,54 115,44 L 108,32
        Q 104,22 100,14 L 100,8 Z`,
  },

  // ── Classic circuits ──────────────────────────────────────────────────────

  Bahrain: {
    viewBox: "0 0 200 160",
    // Three-lobe layout: main section, inner loop option, and back section
    d: `M 100,10 L 150,10 Q 178,10 185,35
        L 188,65 Q 190,85 175,92
        L 160,96 Q 148,98 142,110
        L 138,128 Q 134,142 120,144
        L 80,144 Q 65,144 60,130
        L 56,114 Q 50,98 36,96
        L 22,93 Q 8,88 12,65
        L 16,38 Q 22,14 50,10
        L 100,10 Z
        M 90,70 L 110,70 L 110,90 L 90,90 Z`,
  },

  "Abu Dhabi": {
    viewBox: "0 0 200 160",
    // Yas Marina circuit: distinctive marina hotel section as an S-curve appendage
    d: `M 40,20 L 140,20 Q 165,20 168,42
        L 168,62 Q 168,75 155,78
        L 140,80 Q 128,82 125,95
        L 122,115 Q 120,130 108,134
        L 88,136 Q 75,136 72,124
        L 68,108 Q 64,94 50,90
        L 35,86 Q 22,82 18,68
        L 15,48 Q 14,30 28,22
        L 40,20 Z
        M 150,95 L 175,95 Q 185,95 185,105
        L 185,125 Q 185,135 175,135
        L 155,135 Q 145,135 145,125
        L 145,108 Q 145,95 155,95 Z`,
  },

  // ── Red Bull Ring ─────────────────────────────────────────────────────────

  "Red Bull Ring": {
    viewBox: "0 0 200 160",
    // Very compact, only 10 corners, simple clean shape
    d: `M 80,20 L 145,20 Q 160,20 162,35
        L 165,55 Q 167,68 155,72
        L 140,76 Q 128,78 124,90
        L 120,110 Q 116,125 102,128
        L 78,130 Q 62,130 55,118
        L 48,104 Q 44,90 54,82
        L 68,76 Q 78,70 80,58
        L 80,20 Z`,
  },

  // ── Modern circuits ───────────────────────────────────────────────────────

  Zandvoort: {
    viewBox: "0 0 200 160",
    // Compact banked circuit, roughly triangular-oval
    d: `M 60,20 L 130,20 Q 160,20 170,42
        L 176,70 Q 180,90 172,108
        L 160,124 Q 148,138 128,140
        L 80,140 Q 58,140 44,124
        L 30,108 Q 20,90 24,68
        L 32,42 Q 42,20 60,20 Z`,
  },

  COTA: {
    viewBox: "0 0 200 160",
    // Circuit of the Americas: complex with 20 corners, distinctive uphill start
    d: `M 105,10 L 185,10 Q 190,10 190,20
        L 188,40 Q 186,50 176,52
        L 164,54 Q 154,55 150,65
        L 148,82 Q 146,94 155,100
        L 168,108 Q 178,116 176,128
        L 170,144 Q 164,154 152,154
        L 128,154 Q 116,154 112,144
        L 110,130 Q 106,118 94,114
        L 78,110 Q 66,106 62,116
        L 58,130 Q 54,142 42,146
        L 24,148 Q 12,148 10,136
        L 8,118 Q 8,106 18,100
        L 36,92 Q 48,86 50,74
        L 50,55 Q 48,44 38,40
        L 22,36 Q 12,32 14,20
        L 18,10 L 105,10 Z`,
  },

  Interlagos: {
    viewBox: "0 0 200 160",
    // Compact, distinctive counterclockwise layout, Senna S at top
    d: `M 95,12 L 135,12 Q 148,12 150,24
        L 152,44 Q 153,56 142,60
        L 128,64 Q 116,66 112,78
        L 108,94 Q 104,108 92,112
        L 70,116 Q 55,116 46,106
        L 36,94 Q 28,80 34,66
        L 46,52 Q 56,40 68,36
        L 80,32 Q 90,28 92,16
        L 95,12 Z
        M 55,80 L 80,70 Q 88,68 90,78
        L 90,96 Q 88,105 78,106
        L 58,106 Q 48,104 46,94
        L 44,80 Q 44,70 55,70 Z`,
  },

  Montreal: {
    viewBox: "0 0 200 160",
    // Île Notre-Dame island circuit: long straight, hairpin at end, narrow and elongated
    d: `M 15,80 L 15,45 Q 15,30 28,25
        L 80,15 Q 96,10 104,20
        L 110,32 Q 114,44 104,50
        L 88,56 Q 76,60 74,72
        L 72,88 Q 70,100 80,104
        L 108,110 Q 120,112 124,122
        L 128,138 Q 130,148 120,150
        L 40,150 Q 28,150 24,140
        L 18,118 Q 14,104 24,98
        L 40,92 Q 52,86 50,74
        L 48,60 Q 46,50 34,48
        L 18,46 Q 10,44 12,34
        L 15,22 Z`,
  },

  Hungaroring: {
    viewBox: "0 0 200 160",
    // Very twisty, tight circuit with many direction changes
    d: `M 95,15 L 140,15 Q 155,15 158,28
        L 162,50 Q 164,63 152,68
        L 136,72 Q 125,74 122,86
        L 118,104 Q 115,118 103,120
        L 80,122 Q 65,120 56,110
        L 44,98 Q 36,86 42,74
        L 54,64 Q 64,56 66,44
        L 66,28 Q 66,16 78,14
        L 95,12 Q 100,12 100,20
        Q 100,28 92,30 L 82,32
        Q 74,34 72,44 L 70,60
        Q 68,72 78,76 L 100,78
        Q 110,80 114,90 L 115,108
        Q 115,118 125,118 Z`,
  },

  Catalunya: {
    viewBox: "0 0 200 160",
    // Spanish GP at Barcelona: long start straight, technical middle, constant-radius final corners
    d: `M 20,80 L 20,50 Q 20,35 34,28
        L 80,18 Q 96,14 104,26
        L 110,40 Q 114,54 104,62
        L 88,70 Q 76,76 74,90
        L 72,110 Q 70,124 82,128
        L 120,132 Q 134,132 140,120
        L 144,104 Q 146,90 158,86
        L 175,82 Q 185,78 186,66
        L 186,44 Q 184,30 170,26
        L 155,22 Q 144,18 140,8
        L 138,4 L 185,4 Q 196,4 196,15
        L 196,85 Q 196,100 184,105
        L 155,112 Q 140,115 138,128
        L 135,148 Q 132,158 120,158
        L 60,158 Q 46,158 40,147
        L 30,130 Q 22,115 30,105
        L 44,98 Q 55,92 56,80
        L 55,64 Q 53,52 42,48
        L 26,44 Q 16,42 16,54
        L 16,70 Z`,
  },

  // ── Middle Eastern circuits ───────────────────────────────────────────────

  Qatar: {
    viewBox: "0 0 200 160",
    // Losail circuit: smooth flowing track, stadium section
    d: `M 30,80 Q 30,35 70,14 Q 110,-8 155,14
        Q 195,36 192,80 Q 189,124 150,142
        Q 110,160 70,140 Q 30,120 30,80 Z
        M 65,80 Q 65,108 90,120 Q 115,132 140,118
        Q 165,104 163,80 Q 161,54 136,44
        Q 110,34 86,48 Q 62,62 65,80 Z`,
  },

  "Albert Park": {
    viewBox: "0 0 200 160",
    // Lake Williamstown circuit: lake in centre, irregular oval street circuit
    d: `M 100,10 L 155,10 Q 175,10 180,28
        L 185,50 Q 188,64 178,72
        L 162,78 Q 150,82 148,96
        L 146,116 Q 144,130 130,136
        L 100,142 Q 80,144 62,136
        L 44,126 Q 32,114 34,98
        L 38,78 Q 42,64 30,56
        L 16,48 Q 8,38 14,24
        L 22,10 L 100,10 Z`,
  },

  "Las Vegas": {
    viewBox: "0 0 200 160",
    // Very long straight (Las Vegas Strip), rectangular street circuit
    d: `M 10,140 L 10,20 Q 10,10 22,10
        L 50,10 Q 62,10 64,22
        L 68,40 L 68,120 L 130,120
        L 130,40 L 132,22
        Q 134,10 146,10 L 175,10
        Q 188,10 188,22 L 188,140
        Q 188,150 175,150 L 22,150
        Q 10,150 10,140 Z`,
  },

  "Mexico City": {
    viewBox: "0 0 200 160",
    // Autodromo Hermanos Rodriguez: stadium section (Peraltada), distinctive oval section
    d: `M 100,10 L 165,10 Q 180,10 183,24
        L 185,50 Q 186,64 174,68
        L 155,72 Q 143,74 140,86
        L 138,104 Q 136,116 124,120
        L 105,124 Q 92,124 88,114
        L 85,100 L 60,100 Q 50,100 46,110
        L 40,124 Q 36,136 24,138
        L 8,138 Q -2,136 3,122
        L 18,80 Q 24,64 12,50
        L 6,36 Q 2,22 16,14
        L 32,8 Q 46,4 52,16
        L 58,32 Q 62,44 56,58
        L 52,70 L 78,70 Q 90,70 90,58
        L 90,26 Q 90,10 100,10 Z`,
  },

  Imola: {
    viewBox: "0 0 200 160",
    // Historic circuit (used in trivia, not on the 2026 calendar): Tamburello chicane area
    d: `M 100,10 L 160,10 Q 175,10 178,24
        L 180,48 Q 181,62 168,67
        L 150,72 Q 138,75 135,88
        L 132,108 Q 129,122 116,126
        L 90,130 Q 72,130 62,118
        L 50,106 Q 42,92 48,78
        L 60,65 Q 72,54 70,40
        L 68,22 Q 67,10 80,8
        L 100,10 Z`,
  },
};

// Circuits available for layout questions — index for quick lookup
export const AVAILABLE_CIRCUITS = Object.keys(CIRCUIT_LAYOUTS);
