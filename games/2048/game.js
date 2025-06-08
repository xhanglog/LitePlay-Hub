// 2048游戏核心逻辑
class Game2048 {
    constructor() {
        this.size = 4; // 4x4网格
        this.tileContainer = document.getElementById('tile-container');
        this.scoreContainer = document.getElementById('score');
        this.bestScoreContainer = document.getElementById('best-score');
        this.messageContainer = document.querySelector('.game-message');
        
        this.score = 0;
        this.bestScore = this.getBestScore();
        
        this.grid = this.createGrid();
        this.setup();
        
        // 绑定按键事件
        this.bindKeyEvents();
        
        // 绑定触摸事件
        this.bindTouchEvents();
        
        // 绑定重新开始按钮
        document.getElementById('restart').addEventListener('click', () => {
            this.restart();
        });
        
        // 绑定重试按钮
        document.querySelector('.retry-button').addEventListener('click', () => {
            this.restart();
        });
    }
    
    // 创建空网格
    createGrid() {
        let grid = [];
        for (let i = 0; i < this.size; i++) {
            grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                grid[i][j] = null;
            }
        }
        return grid;
    }
    
    // 初始化游戏
    setup() {
        this.clearGrid();
        this.addStartTiles();
        this.updateScore(0);
        this.updateBestScore();
    }
    
    // 清空网格
    clearGrid() {
        this.grid = this.createGrid();
        this.tileContainer.innerHTML = '';
    }
    
    // 添加初始方块
    addStartTiles() {
        for (let i = 0; i < 2; i++) {
            this.addRandomTile();
        }
    }
    
    // 添加随机方块
    addRandomTile() {
        if (this.isGridFull()) return;
        
        let value = Math.random() < 0.9 ? 2 : 4;
        let position = this.getRandomEmptyCell();
        
        if (position) {
            let tile = this.createTile(position, value);
            this.grid[position.x][position.y] = tile;
        }
    }
    
    // 获取随机空单元格
    getRandomEmptyCell() {
        let emptyCells = [];
        
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (!this.grid[x][y]) {
                    emptyCells.push({x: x, y: y});
                }
            }
        }
        
        if (emptyCells.length) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        return null;
    }
    
    // 创建方块元素
    createTile(position, value) {
        let tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        tile.style.transform = `translate(${position.y * 121.25}px, ${position.x * 121.25}px)`;
        
        this.tileContainer.appendChild(tile);
        
        return {
            value: value,
            element: tile,
            x: position.x,
            y: position.y
        };
    }
    
    // 移动方块
    moveTile(tile, position) {
        this.grid[tile.x][tile.y] = null;
        this.grid[position.x][position.y] = tile;
        
        tile.x = position.x;
        tile.y = position.y;
        
        tile.element.style.transform = `translate(${position.y * 121.25}px, ${position.x * 121.25}px)`;
    }
    
    // 合并方块
    mergeTiles(tile1, tile2) {
        let newValue = tile1.value + tile2.value;
        
        // 更新第一个方块
        tile1.value = newValue;
        tile1.element.textContent = newValue;
        tile1.element.className = `tile tile-${newValue}`;
        
        // 移除第二个方块
        this.grid[tile2.x][tile2.y] = null;
        this.tileContainer.removeChild(tile2.element);
        
        // 更新分数
        this.updateScore(this.score + newValue);
        
        // 检查是否胜利
        if (newValue === 2048) {
            this.win();
        }
    }
    
    // 更新分数
    updateScore(score) {
        this.score = score;
        this.scoreContainer.textContent = score;
        
        if (score > this.bestScore) {
            this.bestScore = score;
            this.updateBestScore();
            this.saveBestScore();
        }
    }
    
    // 更新最高分
    updateBestScore() {
        this.bestScoreContainer.textContent = this.bestScore;
    }
    
    // 保存最高分
    saveBestScore() {
        localStorage.setItem('bestScore2048', this.bestScore);
    }
    
    // 获取最高分
    getBestScore() {
        return parseInt(localStorage.getItem('bestScore2048')) || 0;
    }
    
    // 绑定键盘事件
    bindKeyEvents() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move(0, -1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move(0, 1);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move(-1, 0);
                    break;
            }
        });
    }
    
    // 绑定触摸事件
    bindTouchEvents() {
        let touchStartX, touchStartY;
        let touchEndX, touchEndY;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            
            let dx = touchEndX - touchStartX;
            let dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                // 水平滑动
                if (dx > 0) {
                    this.move(1, 0); // 右
                } else {
                    this.move(-1, 0); // 左
                }
            } else {
                // 垂直滑动
                if (dy > 0) {
                    this.move(0, 1); // 下
                } else {
                    this.move(0, -1); // 上
                }
            }
        });
    }
    
    // 移动方块
    move(dx, dy) {
        let moved = false;
        
        if (dx === 1) {
            // 向右移动
            for (let x = 0; x < this.size; x++) {
                for (let y = this.size - 2; y >= 0; y--) {
                    if (this.grid[x][y]) {
                        moved = this.moveInDirection(x, y, dx, dy) || moved;
                    }
                }
            }
        } else if (dx === -1) {
            // 向左移动
            for (let x = 0; x < this.size; x++) {
                for (let y = 1; y < this.size; y++) {
                    if (this.grid[x][y]) {
                        moved = this.moveInDirection(x, y, dx, dy) || moved;
                    }
                }
            }
        } else if (dy === 1) {
            // 向下移动
            for (let y = 0; y < this.size; y++) {
                for (let x = this.size - 2; x >= 0; x--) {
                    if (this.grid[x][y]) {
                        moved = this.moveInDirection(x, y, dx, dy) || moved;
                    }
                }
            }
        } else if (dy === -1) {
            // 向上移动
            for (let y = 0; y < this.size; y++) {
                for (let x = 1; x < this.size; x++) {
                    if (this.grid[x][y]) {
                        moved = this.moveInDirection(x, y, dx, dy) || moved;
                    }
                }
            }
        }
        
        if (moved) {
            setTimeout(() => {
                this.addRandomTile();
                
                if (!this.movesAvailable()) {
                    this.gameOver();
                }
            }, 100);
        }
    }
    
    // 在特定方向上移动方块
    moveInDirection(x, y, dx, dy) {
        let moved = false;
        let tile = this.grid[x][y];
        let newX = x;
        let newY = y;
        
        // 计算新位置
        while (true) {
            newX += dy;
            newY += dx;
            
            // 超出边界
            if (newX < 0 || newX >= this.size || newY < 0 || newY >= this.size) {
                break;
            }
            
            let nextTile = this.grid[newX][newY];
            
            // 空单元格
            if (!nextTile) {
                moved = true;
                continue;
            }
            
            // 可以合并
            if (nextTile.value === tile.value) {
                this.mergeTiles(nextTile, tile);
                moved = true;
            }
            
            break;
        }
        
        // 移动到最远的空单元格
        if (moved) {
            newX -= dy;
            newY -= dx;
            
            if (newX !== x || newY !== y) {
                this.moveTile(tile, {x: newX, y: newY});
            }
        }
        
        return moved;
    }
    
    // 检查是否还有可用的移动
    movesAvailable() {
        // 检查是否有空单元格
        if (!this.isGridFull()) {
            return true;
        }
        
        // 检查是否有可以合并的方块
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                let tile = this.grid[x][y];
                
                // 检查右侧
                if (y < this.size - 1 && tile.value === this.grid[x][y + 1].value) {
                    return true;
                }
                
                // 检查下方
                if (x < this.size - 1 && tile.value === this.grid[x + 1][y].value) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // 检查网格是否已满
    isGridFull() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (!this.grid[x][y]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // 游戏胜利
    win() {
        this.messageContainer.classList.add('game-won');
        this.messageContainer.querySelector('p').textContent = '你赢了!';
    }
    
    // 游戏结束
    gameOver() {
        this.messageContainer.classList.add('game-over');
        this.messageContainer.querySelector('p').textContent = '游戏结束!';
    }
    
    // 重新开始游戏
    restart() {
        this.messageContainer.classList.remove('game-won', 'game-over');
        this.setup();
    }
}

// 当页面加载完成时初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
}); 