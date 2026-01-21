// Warp using two offset noise samples
v.warpX = q.noise(v.originx * 0.01, v.originz * 0.01) * 20;
v.warpZ = q.noise((v.originx + 1234) * 0.01, (v.originz + 1234) * 0.01) * 20;

// Sample main noise at warped coordinates
v.n = q.noise(v.originx * 0.01 + v.warpX, v.originz * 0.01 + v.warpZ) / 2 + 0.5;

return v.n
