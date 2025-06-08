document.addEventListener('DOMContentLoaded', () => {
    // 游戏配置
    const config = {
        easy: { rows: 9, cols: 9, mines: 10 },
        medium: { rows: 16, cols: 16, mines: 40 },
        hard: { rows: 16, cols: 30, mines: 99 }
    };
    
    // 游戏状态
    let gameBoard = [];
    let minesCount = 0;
    let revealedCount = 0;
    let gameOver = false;
    let timerInterval = null;
    let timeElapsed = 0;
    let firstClick = true;
    let currentDifficulty = 'medium';
    
    // DOM元素
    const boardElement = document.getElementById('game-board');
    const difficultySelect = document.getElementById('difficulty');
    const newGameBtn = document.getElementById('new-game-btn');
    const minesCountElement = document.getElementById('mines-count');
    const timerElement = document.getElementById('timer');
    const gameResultModal = document.getElementById('game-result');
    const resultMessageElement = document.getElementById('result-message');
    const finalTimeElement = document.getElementById('final-time');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    // 初始化游戏
    function initGame() {
        // 停止计时器
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // 重置游戏状态
        gameOver = false;
        firstClick = true;
        timeElapsed = 0;
        revealedCount = 0;
        timerElement.textContent = '0';
        
        // 获取当前难度
        currentDifficulty = difficultySelect.value;
        const { rows, cols, mines } = config[currentDifficulty];
        
        // 更新雷数显示
        minesCount = mines;
        minesCountElement.textContent = minesCount;
        
        // 调整游戏板样式
        boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
        boardElement.style.gridTemplateRows = `repeat(${rows}, 30px)`;
        
        // 清空游戏板
        boardElement.innerHTML = '';
        
        // 创建游戏板数据
        gameBoard = Array.from({ length: rows }, () => 
            Array.from({ length: cols }, () => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            }))
        );
        
        // 创建单元格元素
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 添加点击事件
                cell.addEventListener('click', () => handleCellClick(row, col));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleRightClick(row, col);
                });
                cell.addEventListener('dblclick', () => handleDoubleClick(row, col));
                
                boardElement.appendChild(cell);
            }
        }
    }
    
    // 生成地雷
    function generateMines(firstRow, firstCol) {
        const { rows, cols, mines } = config[currentDifficulty];
        let minesPlaced = 0;
        
        // 确保首次点击不是地雷
        const safeZone = [];
        for (let r = Math.max(0, firstRow - 1); r <= Math.min(rows - 1, firstRow + 1); r++) {
            for (let c = Math.max(0, firstCol - 1); c <= Math.min(cols - 1, firstCol + 1); c++) {
                safeZone.push(`${r},${c}`);
            }
        }
        
        while (minesPlaced < mines) {
            const randomRow = Math.floor(Math.random() * rows);
            const randomCol = Math.floor(Math.random() * cols);
            const key = `${randomRow},${randomCol}`;
            
            if (!gameBoard[randomRow][randomCol].isMine && !safeZone.includes(key)) {
                gameBoard[randomRow][randomCol].isMine = true;
                minesPlaced++;
            }
        }
        
        // 计算每个单元格周围的地雷数
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!gameBoard[row][col].isMine) {
                    gameBoard[row][col].adjacentMines = countAdjacentMines(row, col);
                }
            }
        }
    }
    
    // 计算周围地雷数
    function countAdjacentMines(row, col) {
        const { rows, cols } = config[currentDifficulty];
        let count = 0;
        
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                if (gameBoard[r][c].isMine) count++;
            }
        }
        
        return count;
    }
    
    // 处理单元格点击
    function handleCellClick(row, col) {
        if (gameOver) return;
        
        const cell = gameBoard[row][col];
        
        // 如果已标记或已揭开，不执行操作
        if (cell.isFlagged || cell.isRevealed) return;
        
        // 首次点击
        if (firstClick) {
            firstClick = false;
            generateMines(row, col);
            startTimer();
        }
        
        // 点到地雷，游戏结束
        if (cell.isMine) {
            revealAllMines();
            endGame(false);
            return;
        }
        
        // 揭开单元格
        revealCell(row, col);
        
        // 检查是否胜利
        checkWin();
    }
    
    // 处理右键点击（标记地雷）
    function handleRightClick(row, col) {
        if (gameOver || firstClick) return;
        
        const cell = gameBoard[row][col];
        
        // 如果已揭开，不执行操作
        if (cell.isRevealed) return;
        
        // 切换标记状态
        cell.isFlagged = !cell.isFlagged;
        
        // 更新雷数计数
        minesCount += cell.isFlagged ? -1 : 1;
        minesCountElement.textContent = minesCount;
        
        // 更新单元格显示
        updateCellDisplay(row, col);
    }
    
    // 处理双击（快速揭开周围单元格）
    function handleDoubleClick(row, col) {
        if (gameOver || firstClick) return;
        
        const cell = gameBoard[row][col];
        
        // 如果未揭开或周围没有地雷，不执行操作
        if (!cell.isRevealed || cell.adjacentMines === 0) return;
        
        const { rows, cols } = config[currentDifficulty];
        let flaggedCount = 0;
        
        // 计算周围标记的单元格数
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                if (gameBoard[r][c].isFlagged) flaggedCount++;
            }
        }
        
        // 如果标记数等于周围地雷数，揭开周围未标记的单元格
        if (flaggedCount === cell.adjacentMines) {
            for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                    if (r === row && c === col) continue;
                    if (!gameBoard[r][c].isRevealed && !gameBoard[r][c].isFlagged) {
                        handleCellClick(r, c);
                    }
                }
            }
        }
    }
    
    // 揭开单元格
    function revealCell(row, col) {
        const { rows, cols } = config[currentDifficulty];
        const cell = gameBoard[row][col];
        
        // 如果已揭开或已标记，不执行操作
        if (cell.isRevealed || cell.isFlagged) return;
        
        // 标记为已揭开
        cell.isRevealed = true;
        revealedCount++;
        
        // 更新单元格显示
        updateCellDisplay(row, col);
        
        // 如果周围没有地雷，递归揭开周围单元格
        if (cell.adjacentMines === 0) {
            for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                    if (r === row && c === col) continue;
                    revealCell(r, c);
                }
            }
        }
    }
    
    // 揭开所有地雷
    function revealAllMines() {
        const { rows, cols } = config[currentDifficulty];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = gameBoard[row][col];
                
                if (cell.isMine) {
                    cell.isRevealed = true;
                    updateCellDisplay(row, col);
                }
            }
        }
    }
    
    // 更新单元格显示
    function updateCellDisplay(row, col) {
        const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        const cell = gameBoard[row][col];
        
        // 重置类名
        cellElement.className = 'cell';
        
        if (cell.isRevealed) {
            cellElement.classList.add('revealed');
            
            if (cell.isMine) {
                cellElement.classList.add('mine');
            } else if (cell.adjacentMines > 0) {
                cellElement.classList.add(`number-${cell.adjacentMines}`);
                cellElement.textContent = cell.adjacentMines;
            }
        } else if (cell.isFlagged) {
            cellElement.classList.add('flagged');
        }
    }
    
    // 检查是否胜利
    function checkWin() {
        const { rows, cols, mines } = config[currentDifficulty];
        const totalCells = rows * cols;
        
        if (revealedCount === totalCells - mines) {
            endGame(true);
        }
    }
    
    // 开始计时器
    function startTimer() {
        timerInterval = setInterval(() => {
            timeElapsed++;
            timerElement.textContent = timeElapsed;
        }, 1000);
    }
    
    // 结束游戏
    function endGame(isWin) {
        gameOver = true;
        
        // 停止计时器
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // 显示结果
        resultMessageElement.textContent = isWin ? '恭喜你赢了！' : '游戏结束！';
        finalTimeElement.textContent = timeElapsed;
        gameResultModal.style.display = 'flex';
    }
    
    // 事件监听
    difficultySelect.addEventListener('change', initGame);
    newGameBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', () => {
        gameResultModal.style.display = 'none';
        initGame();
    });
    
    // 防止右键菜单
    boardElement.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // 初始化游戏
    initGame();
}); 