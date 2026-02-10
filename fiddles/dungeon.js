// Geometric dungeon with varied room shapes and connecting hallways
// Rooms have different dimensions, hallways route between room centers

v.seed = 12345;
v.cell_size = 48;

// === CELL COORDINATES ===
v.grid_x = math.floor(v.originx / v.cell_size);
v.grid_z = math.floor(v.originz / v.cell_size);
v.local_x = math.mod(v.originx, v.cell_size);
v.local_z = math.mod(v.originz, v.cell_size);

// === ROOM GENERATION (per-cell) ===
// Determine if this cell has a room
v.room_exists = q.noise(v.grid_x * 0.7 + v.seed, v.grid_z * 0.7 + v.seed) > -0.2;

// Room dimensions vary per cell (different shapes!)
v.room_w_noise = q.noise(v.grid_x + v.seed, v.grid_z) * 0.5 + 0.5;
v.room_h_noise = q.noise(v.grid_x, v.grid_z + v.seed) * 0.5 + 0.5;

// Room size: between 16 and 40 blocks
v.room_width = 16 + math.floor(v.room_w_noise * 24);
v.room_height = 16 + math.floor(v.room_h_noise * 24);

// Room position offset within cell (so rooms aren't always centered)
v.offset_x_noise = q.noise(v.grid_x * 2 + v.seed, v.grid_z * 2);
v.offset_z_noise = q.noise(v.grid_x * 2, v.grid_z * 2 + v.seed);

v.room_left = 4 + math.floor(v.offset_x_noise * (v.cell_size - v.room_width - 8));
v.room_top = 4 + math.floor(v.offset_z_noise * (v.cell_size - v.room_height - 8));
v.room_right = v.room_left + v.room_width;
v.room_bottom = v.room_top + v.room_height;

// Check if current position is inside this room
v.in_room = v.local_x >= v.room_left && v.local_x <= v.room_right &&
            v.local_z >= v.room_top && v.local_z <= v.room_bottom;

// === HALLWAY CONNECTIONS ===
// Check which neighboring cells have rooms
v.north_room = q.noise(v.grid_x * 0.7 + v.seed, (v.grid_z - 1) * 0.7 + v.seed) > -0.2;
v.south_room = q.noise(v.grid_x * 0.7 + v.seed, (v.grid_z + 1) * 0.7 + v.seed) > -0.2;
v.west_room = q.noise((v.grid_x - 1) * 0.7 + v.seed, v.grid_z * 0.7 + v.seed) > -0.2;
v.east_room = q.noise((v.grid_x + 1) * 0.7 + v.seed, v.grid_z * 0.7 + v.seed) > -0.2;

// Calculate room centers for hallway connection
v.room_center_x = v.room_left + v.room_width / 2;
v.room_center_z = v.room_top + v.room_height / 2;

// Doorways - openings in room walls where hallways connect
v.doorway_width = 4;
v.is_doorway = false;

// North doorway
if (v.north_room && v.local_z >= v.room_top - v.doorway_width && v.local_z < v.room_top &&
    math.abs(v.local_x - v.room_center_x) < v.doorway_width) {
    v.is_doorway = true;
}
// South doorway
if (v.south_room && v.local_z <= v.room_bottom + v.doorway_width && v.local_z > v.room_bottom &&
    math.abs(v.local_x - v.room_center_x) < v.doorway_width) {
    v.is_doorway = true;
}
// West doorway
if (v.west_room && v.local_x >= v.room_left - v.doorway_width && v.local_x < v.room_left &&
    math.abs(v.local_z - v.room_center_z) < v.doorway_width) {
    v.is_doorway = true;
}
// East doorway
if (v.east_room && v.local_x <= v.room_right + v.doorway_width && v.local_x > v.room_right &&
    math.abs(v.local_z - v.room_center_z) < v.doorway_width) {
    v.is_doorway = true;
}

// === HALLWAY ROUTING ===
// Hallways run from room center to cell edge, connecting to neighbors

v.in_hallway = false;

// Vertical hallway (north-south) - extends from room center to cell edges
v.v_hallway_width = 3;
if (v.local_x > v.room_center_x - v.v_hallway_width && v.local_x < v.room_center_x + v.v_hallway_width) {
    // Connects north
    if (v.north_room && v.local_z < v.room_center_z) {
        v.in_hallway = true;
    }
    // Connects south
    if (v.south_room && v.local_z >= v.room_center_z) {
        v.in_hallway = true;
    }
}

// Horizontal hallway (east-west) - extends from room center to cell edges
v.h_hallway_width = 3;
if (v.local_z > v.room_center_z - v.h_hallway_width && v.local_z < v.room_center_z + v.h_hallway_width) {
    // Connects west
    if (v.west_room && v.local_x < v.room_center_x) {
        v.in_hallway = true;
    }
    // Connects east
    if (v.east_room && v.local_x >= v.room_center_x) {
        v.in_hallway = true;
    }
}

// Intersection area (where hallways cross outside room)
if (v.local_x > v.room_center_x - v.v_hallway_width && v.local_x < v.room_center_x + v.v_hallway_width &&
    v.local_z > v.room_center_z - v.h_hallway_width && v.local_z < v.room_center_z + v.h_hallway_width &&
    !v.in_room) {
    v.in_hallway = true;
}

// === WALL/FLOOR DETERMINATION ===
v.is_wall = true;

// Floor inside room
if (v.room_exists && v.in_room) {
    v.is_wall = false;
}

// Floor in doorways
if (v.is_doorway) {
    v.is_wall = false;
}

// Floor in hallways
if (v.in_hallway) {
    v.is_wall = false;
}

// === COLOR MAPPING ===
// Floor texture
v.floor_noise = q.noise(v.originx * 0.15 + v.seed, v.originz * 0.15 + v.seed) * 0.5 + 0.5;

// Room floors - warm stone
v.floor_color = v.floor_noise < 0.33
    ? { r: 0.30, g: 0.26, b: 0.22 }
    : v.floor_noise < 0.66
    ? { r: 0.22, g: 0.19, b: 0.16 }
    : { r: 0.16, g: 0.14, b: 0.12 };

// Hallway floors - slightly different tone
if (v.in_hallway && !v.in_room) {
    v.floor_color.r += 0.02;
    v.floor_color.g += 0.02;
    v.floor_color.b += 0.02;
}

// Wall color
v.wall_noise = q.noise(v.originx * 0.08 + v.seed, v.originz * 0.08) * 0.5 + 0.5;
v.wall_color = {
    r: 0.14 + v.wall_noise * 0.08,
    g: 0.12 + v.wall_noise * 0.07,
    b: 0.10 + v.wall_noise * 0.06
};

// Doorway accent
if (v.is_doorway) {
    v.floor_color.r += 0.06;
    v.floor_color.g += 0.04;
}

// Room edge highlight
v.at_room_edge = v.in_room && (
    v.local_x <= v.room_left + 1 || v.local_x >= v.room_right - 1 ||
    v.local_z <= v.room_top + 1 || v.local_z >= v.room_bottom - 1
);
if (v.at_room_edge) {
    v.floor_color.r *= 0.85;
    v.floor_color.g *= 0.85;
    v.floor_color.b *= 0.85;
}

return v.is_wall ? v.wall_color : v.floor_color;
