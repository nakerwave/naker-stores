import { Vector2 } from '@babylonjs/core/Maths/math';

/**
 * Manage the grid position
 */

export class TileMap {

    center = Vector2.Zero();
    gridSpot: Array<Array<number>>;
    spotWidthNumber = 20;
    resetGridSpot() {
        this.gridSpot = Array(this.spotWidthNumber).fill().map(() => Array(this.spotWidthNumber).fill());
        // Do not put store where the house is
        this.gridSpot[this.spotWidthNumber / 2][this.spotWidthNumber / 2] = 1;
    }

    spotWidth = 10;
    getFreeSpot(position: Vector2) {
        let roundPos = { x: Math.round(position.x / this.spotWidth), y: Math.round(position.y / this.spotWidth) };

        let offset = this.spotWidthNumber / 2;
        let gridPos = { x: roundPos.x + offset, y: roundPos.y + offset };

        while (this.gridSpot[gridPos.x][gridPos.y]) {
            gridPos.x += Math.round((Math.random() - 0.5) * 2);
            gridPos.y += Math.round((Math.random() - 0.5) * 2);
        }
        this.gridSpot[gridPos.x][gridPos.y] = 1;

        position.x = (gridPos.x - offset) * this.spotWidth;
        position.y = (gridPos.y - offset) * this.spotWidth;
        return position;
    }
}