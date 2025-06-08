document.addEventListener('DOMContentLoaded', () => {
    // 获取画布和上下文
    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next');
    const nextContext = nextCanvas.getContext('2d');
    
    // 设置方块大小和游戏区域大小
    const blockSize = 30;
    const rows = 20;
    const cols = 10;
    
    // 游戏状态
    let score = 0;
    let level = 1;
    let lines = 0;
    let gameOver = false;
    let isPaused = false;
    let gameStarted = false;
    
    // 方块形状和颜色
    const shapes = [
        // I形
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        // J形
        [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        // L形
        [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        // O形
        [
            [1, 1],
            [1, 1]
        ],
        // S形
        [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        // T形
        [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        // Z形
        [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ]
    ];
    
    const colors = [
        '#00FFFF', // 青色 - I
        '#0000FF', // 蓝色 - J
        '#FF7F00', // 橙色 - L
        '#FFFF00', // 黄色 - O
        '#00FF00', // 绿色 - S
        '#800080', // 紫色 - T
        '#FF0000'  // 红色 - Z
    ];
    
    // 创建游戏板
    let board = Array.from({length: rows}, () => Array(cols).fill(0));
    
    // 当前方块和下一个方块
    let currentPiece = null;
    let nextPiece = null;
    
    // 初始化游戏
    function init() {
        // 重置游戏状态
        score = 0;
        level = 1;
        lines = 0;
        gameOver = false;
        isPaused = false;
        
        // 清空游戏板
        board = Array.from({length: rows}, () => Array(cols).fill(0));
        
        // 更新显示
        updateScore();
        
        // 生成第一个方块
        createNewPiece();
        
        // 开始游戏循环
        if (!gameStarted) {
            gameLoop();
            gameStarted = true;
        }
    }
    
    // 创建新方块
    function createNewPiece() {
        if (nextPiece === null) {
            nextPiece = {
                shape: Math.floor(Math.random() * shapes.length),
                x: Math.floor(cols / 2) - 1,
                y: 0,
                rotation: 0
            };
        }
        
        currentPiece = nextPiece;
        
        nextPiece = {
            shape: Math.floor(Math.random() * shapes.length),
            x: Math.floor(cols / 2) - 1,
            y: 0,
            rotation: 0
        };
        
        // 检查游戏是否结束
        if (!isValidMove(currentPiece.x, currentPiece.y, currentPiece.shape, currentPiece.rotation)) {
            gameOver = true;
            showGameOver();
        }
        
        // 绘制下一个方块预览
        drawNextPiece();
    }
    
    // 绘制下一个方块预览
    function drawNextPiece() {
        nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        
        const shape = shapes[nextPiece.shape];
        const color = colors[nextPiece.shape];
        
        const offsetX = (nextCanvas.width / blockSize - shape[0].length) / 2;
        const offsetY = (nextCanvas.height / blockSize - shape.length) / 2;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    drawBlock(nextContext, (offsetX + x) * blockSize, (offsetY + y) * blockSize, color);
                }
            }
        }
    }
    
    // 绘制方块
    function drawBlock(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, blockSize, blockSize);
        
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x, y, blockSize, blockSize);
        
        // 添加高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x, y, blockSize, blockSize / 4);
        ctx.fillRect(x, y, blockSize / 4, blockSize);
    }
    
    // 绘制游戏板
    function drawBoard() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制已固定的方块
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (board[y][x]) {
                    drawBlock(context, x * blockSize, y * blockSize, colors[board[y][x] - 1]);
                }
            }
        }
        
        // 绘制当前方块
        if (currentPiece) {
            const shape = getRotatedShape();
            const color = colors[currentPiece.shape];
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        drawBlock(
                            context,
                            (currentPiece.x + x) * blockSize,
                            (currentPiece.y + y) * blockSize,
                            color
                        );
                    }
                }
            }
        }
    }
    
    // 获取旋转后的形状
    function getRotatedShape() {
        const shape = shapes[currentPiece.shape];
        let rotated = shape;
        
        for (let i = 0; i < currentPiece.rotation; i++) {
            rotated = rotateShape(rotated);
        }
        
        return rotated;
    }
    
    // 旋转形状
    function rotateShape(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = Array.from({length: cols}, () => Array(rows).fill(0));
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - 1 - y] = shape[y][x];
            }
        }
        
        return rotated;
    }
    
    // 检查移动是否有效
    function isValidMove(x, y, shape, rotation) {
        const rotatedShape = shapes[shape];
        let tempShape = rotatedShape;
        
        for (let i = 0; i < rotation; i++) {
            tempShape = rotateShape(tempShape);
        }
        
        for (let row = 0; row < tempShape.length; row++) {
            for (let col = 0; col < tempShape[row].length; col++) {
                if (tempShape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    if (newX < 0 || newX >= cols || newY >= rows || (newY >= 0 && board[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    // 移动方块
    function movePiece(dx, dy) {
        if (!gameOver && !isPaused) {
            if (isValidMove(currentPiece.x + dx, currentPiece.y + dy, currentPiece.shape, currentPiece.rotation)) {
                currentPiece.x += dx;
                currentPiece.y += dy;
                drawBoard();
                return true;
            }
        }
        return false;
    }
    
    // 旋转方块
    function rotatePiece() {
        if (!gameOver && !isPaused) {
            const newRotation = (currentPiece.rotation + 1) % 4;
            
            if (isValidMove(currentPiece.x, currentPiece.y, currentPiece.shape, newRotation)) {
                currentPiece.rotation = newRotation;
                drawBoard();
            }
        }
    }
    
    // 将当前方块固定到游戏板上
    function lockPiece() {
        const shape = getRotatedShape();
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = currentPiece.y + y;
                    const boardX = currentPiece.x + x;
                    
                    if (boardY >= 0) {
                        board[boardY][boardX] = currentPiece.shape + 1;
                    }
                }
            }
        }
        
        // 检查并清除完整的行
        clearLines();
        
        // 创建新方块
        createNewPiece();
    }
    
    // 清除完整的行
    function clearLines() {
        let linesCleared = 0;
        
        for (let y = rows - 1; y >= 0; y--) {
            if (board[y].every(cell => cell !== 0)) {
                board.splice(y, 1);
                board.unshift(Array(cols).fill(0));
                linesCleared++;
                y++; // 重新检查当前行，因为上面的行已经下移
            }
        }
        
        if (linesCleared > 0) {
            // 更新分数和等级
            lines += linesCleared;
            score += linesCleared * 100 * level;
            
            // 每清除10行提升一个等级
            level = Math.floor(lines / 10) + 1;
            
            updateScore();
        }
    }
    
    // 更新分数显示
    function updateScore() {
        document.getElementById('score').textContent = score;
        document.getElementById('level').textContent = level;
        document.getElementById('lines').textContent = lines;
    }
    
    // 显示游戏结束
    function showGameOver() {
        document.getElementById('final-score').textContent = score;
        document.getElementById('game-over').style.display = 'flex';
    }
    
    // 游戏循环
    function gameLoop() {
        if (!gameOver && !isPaused) {
            if (!movePiece(0, 1)) {
                lockPiece();
            }
        }
        
        setTimeout(() => {
            requestAnimationFrame(gameLoop);
        }, 1000 / level); // 速度随等级增加
    }
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (gameStarted && !gameOver) {
            switch (e.key) {
                case 'ArrowLeft':
                    movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    rotatePiece();
                    break;
                case ' ':
                    // 硬降（直接下落到底部）
                    while (movePiece(0, 1)) {}
                    lockPiece();
                    break;
                case 'p':
                case 'P':
                    togglePause();
                    break;
            }
        }
    });
    
    // 暂停/继续游戏
    function togglePause() {
        isPaused = !isPaused;
        document.getElementById('pause-btn').textContent = isPaused ? '继续' : '暂停';
    }
    
    // 按钮事件
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('game-over').style.display = 'none';
        init();
    });
    
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    
    document.getElementById('restart-btn').addEventListener('click', () => {
        document.getElementById('game-over').style.display = 'none';
        init();
    });
    
    // 初始绘制
    drawBoard();
}); 