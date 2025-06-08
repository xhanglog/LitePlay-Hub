document.addEventListener('DOMContentLoaded', () => {
    // 获取画布和上下文
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // 获取按钮和分数元素
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const scoreElement = document.getElementById('score');
    
    // 移动控制按钮
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    
    // 游戏参数
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    // 游戏状态
    let gameRunning = false;
    let gamePaused = false;
    let gameSpeed = 150; // 毫秒
    let score = 0;
    
    // 蛇的初始位置和速度
    let snake = [
        { x: 5, y: 5 }
    ];
    let velocityX = 0;
    let velocityY = 0;
    let nextVelocityX = 0;
    let nextVelocityY = 0;
    
    // 食物位置
    let foodX;
    let foodY;
    
    // 游戏循环
    let gameLoop;
    
    // 生成随机食物位置
    function generateFood() {
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);
        
        // 确保食物不会生成在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                generateFood();
                break;
            }
        }
    }
    
    // 游戏更新函数
    function updateGame() {
        if (!gameRunning || gamePaused) return;
        
        // 更新蛇的位置
        velocityX = nextVelocityX;
        velocityY = nextVelocityY;
        
        // 移动蛇
        const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }
        
        // 检查是否撞到自己
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                gameOver();
                return;
            }
        }
        
        // 将新头部添加到蛇身
        snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === foodX && head.y === foodY) {
            // 增加分数
            score += 10;
            scoreElement.textContent = score;
            
            // 生成新食物
            generateFood();
            
            // 增加游戏速度
            if (gameSpeed > 50) {
                gameSpeed -= 2;
                clearInterval(gameLoop);
                gameLoop = setInterval(updateGame, gameSpeed);
            }
        } else {
            // 如果没吃到食物，移除尾部
            snake.pop();
        }
        
        // 绘制游戏
        drawGame();
    }
    
    // 绘制游戏
    function drawGame() {
        // 清除画布
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制食物
        ctx.fillStyle = 'red';
        ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize, gridSize);
        
        // 绘制蛇
        ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < snake.length; i++) {
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 1, gridSize - 1);
        }
        
        // 绘制蛇头
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 1, gridSize - 1);
    }
    
    // 游戏结束
    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);
        alert(`游戏结束！你的得分是: ${score}`);
        startBtn.textContent = '重新开始';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    // 开始游戏
    function startGame() {
        if (gameRunning && !gamePaused) return;
        
        if (!gameRunning) {
            // 重置游戏状态
            snake = [{ x: 5, y: 5 }];
            velocityX = 1;
            velocityY = 0;
            nextVelocityX = 1;
            nextVelocityY = 0;
            score = 0;
            scoreElement.textContent = score;
            gameSpeed = 150;
            generateFood();
            
            gameRunning = true;
            gamePaused = false;
            
            startBtn.textContent = '重新开始';
            pauseBtn.textContent = '暂停';
            pauseBtn.disabled = false;
            
            // 开始游戏循环
            clearInterval(gameLoop);
            gameLoop = setInterval(updateGame, gameSpeed);
        } else if (gamePaused) {
            // 恢复游戏
            gamePaused = false;
            pauseBtn.textContent = '暂停';
            gameLoop = setInterval(updateGame, gameSpeed);
        }
    }
    
    // 暂停游戏
    function pauseGame() {
        if (!gameRunning || gamePaused) return;
        
        gamePaused = true;
        clearInterval(gameLoop);
        pauseBtn.textContent = '继续';
    }
    
    // 键盘控制
    function keyDown(e) {
        if (!gameRunning) return;
        
        // 上
        if (e.keyCode === 38 || e.keyCode === 87) {
            if (velocityY !== 1) { // 不能直接向相反方向移动
                nextVelocityX = 0;
                nextVelocityY = -1;
            }
        }
        // 下
        else if (e.keyCode === 40 || e.keyCode === 83) {
            if (velocityY !== -1) {
                nextVelocityX = 0;
                nextVelocityY = 1;
            }
        }
        // 左
        else if (e.keyCode === 37 || e.keyCode === 65) {
            if (velocityX !== 1) {
                nextVelocityX = -1;
                nextVelocityY = 0;
            }
        }
        // 右
        else if (e.keyCode === 39 || e.keyCode === 68) {
            if (velocityX !== -1) {
                nextVelocityX = 1;
                nextVelocityY = 0;
            }
        }
    }
    
    // 事件监听
    document.addEventListener('keydown', keyDown);
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    
    // 移动端控制
    upBtn.addEventListener('click', () => {
        if (velocityY !== 1 && gameRunning) {
            nextVelocityX = 0;
            nextVelocityY = -1;
        }
    });
    
    downBtn.addEventListener('click', () => {
        if (velocityY !== -1 && gameRunning) {
            nextVelocityX = 0;
            nextVelocityY = 1;
        }
    });
    
    leftBtn.addEventListener('click', () => {
        if (velocityX !== 1 && gameRunning) {
            nextVelocityX = -1;
            nextVelocityY = 0;
        }
    });
    
    rightBtn.addEventListener('click', () => {
        if (velocityX !== -1 && gameRunning) {
            nextVelocityX = 1;
            nextVelocityY = 0;
        }
    });
    
    // 初始化
    pauseBtn.disabled = true;
    drawGame();
}); 