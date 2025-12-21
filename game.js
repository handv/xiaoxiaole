// 游戏配置
const BOARD_SIZE = 6;

// 生成游戏板数字：1-9的乘数和1-81的积
function generateBoardNumbers() {
    const numbers = [];
    // 添加1-9的乘数
    for (let i = 1; i <= 9; i++) {
        numbers.push(i);
    }
    // 添加1-9的乘积（1-81）
    for (let i = 1; i <= 9; i++) {
        for (let j = 1; j <= 9; j++) {
            numbers.push(i * j);
        }
    }
    return numbers;
}

// 游戏状态
let gameState = {
    board: [],
    selectedCombinations: [], // 已选中的组合
    currentSelection: [], // 当前正在选择的三个单元格
    score: 0,
    totalCombinations: 0 // 总共有多少个符合条件的组合
};

// 初始化游戏
function initGame() {
    const numbers = generateBoardNumbers();
    gameState.selectedCombinations = [];
    gameState.currentSelection = [];
    gameState.score = 0;
    gameState.totalCombinations = 0;
    
    // 确保游戏板至少有4个有效组合，最多10个
    let attempts = 0;
    do {
        gameState.board = [];
        
        // 先放置至少4个保证有效的组合
        placeGuaranteedCombinations();
        
        // 随机填充剩余位置
        for (let i = 0; i < BOARD_SIZE; i++) {
            if (!gameState.board[i]) {
                gameState.board[i] = [];
            }
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (gameState.board[i][j] === null || gameState.board[i][j] === undefined) {
                    const randomIndex = Math.floor(Math.random() * numbers.length);
                    gameState.board[i][j] = numbers[randomIndex];
                }
            }
        }
        
        // 计算总共有多少个符合条件的组合
        gameState.totalCombinations = countValidCombinations();
        attempts++;
        
    } while ((gameState.totalCombinations < 4 || gameState.totalCombinations > 10) && attempts < 200);
    
    // 如果尝试后仍然少于4个，强制保证至少4个
    if (gameState.totalCombinations < 4) {
        gameState.totalCombinations = 4;
    }
    
    // 如果超过10个，限制为最多10个
    if (gameState.totalCombinations > 10) {
        gameState.totalCombinations = 10;
    }
    
    renderBoard();
    updateScore();
    showMessage('');
    checkGameOver();
}

// 放置保证有效的组合
function placeGuaranteedCombinations() {
    // 初始化空游戏板
    for (let i = 0; i < BOARD_SIZE; i++) {
        gameState.board[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            gameState.board[i][j] = null;
        }
    }
    
    // 准备一些保证有效的组合（横着、竖着、L型）
    const guaranteedCombos = [
        { type: 'horizontal', row: 0, col: 0, values: [2, 3, 6] },
        { type: 'horizontal', row: 0, col: 3, values: [3, 4, 12] },
        { type: 'horizontal', row: 1, col: 0, values: [4, 5, 20] },
        { type: 'horizontal', row: 1, col: 3, values: [5, 6, 30] },
        { type: 'vertical', row: 2, col: 0, values: [6, 7, 42] },
        { type: 'vertical', row: 3, col: 3, values: [7, 8, 56] },
        { type: 'lshape', row: 2, col: 2, values: [8, 9, 72], shape: 'top-left' },
        { type: 'horizontal', row: 3, col: 0, values: [2, 4, 8] },
        { type: 'horizontal', row: 4, col: 0, values: [3, 5, 15] }
    ];
    
    // 随机选择并放置4个组合
    const shuffled = [...guaranteedCombos].sort(() => Math.random() - 0.5);
    let placed = 0;
    
    for (const combo of shuffled) {
        if (placed >= 4) break;
        
        let positions = [];
        let canPlace = true;
        
        if (combo.type === 'horizontal') {
            if (combo.col + 2 < BOARD_SIZE) {
                positions = [
                    { row: combo.row, col: combo.col },
                    { row: combo.row, col: combo.col + 1 },
                    { row: combo.row, col: combo.col + 2 }
                ];
            } else {
                canPlace = false;
            }
        } else if (combo.type === 'vertical') {
            if (combo.row + 2 < BOARD_SIZE) {
                positions = [
                    { row: combo.row, col: combo.col },
                    { row: combo.row + 1, col: combo.col },
                    { row: combo.row + 2, col: combo.col }
                ];
            } else {
                canPlace = false;
            }
        } else if (combo.type === 'lshape') {
            if (combo.row + 1 < BOARD_SIZE && combo.col + 1 < BOARD_SIZE) {
                positions = [
                    { row: combo.row, col: combo.col },
                    { row: combo.row, col: combo.col + 1 },
                    { row: combo.row + 1, col: combo.col }
                ];
            } else {
                canPlace = false;
            }
        }
        
        // 检查位置是否可用
        if (canPlace) {
            for (const pos of positions) {
                if (gameState.board[pos.row][pos.col] !== null) {
                    canPlace = false;
                    break;
                }
            }
        }
        
        // 放置组合
        if (canPlace) {
            for (let i = 0; i < positions.length; i++) {
                gameState.board[positions[i].row][positions[i].col] = combo.values[i];
            }
            placed++;
        }
    }
    
    // 如果放置的组合少于4个，尝试在其他位置放置简单组合
    if (placed < 4) {
        const simpleCombos = [
            [2, 3, 6], [3, 4, 12], [4, 5, 20], [5, 6, 30],
            [6, 7, 42], [7, 8, 56], [8, 9, 72], [2, 4, 8],
            [3, 5, 15], [2, 5, 10], [3, 6, 18], [4, 6, 24]
        ];
        
        for (const values of simpleCombos) {
            if (placed >= 4) break;
            
            // 尝试横着放置
            for (let row = 0; row < BOARD_SIZE; row++) {
                for (let col = 0; col <= BOARD_SIZE - 3; col++) {
                    if (gameState.board[row][col] === null &&
                        gameState.board[row][col + 1] === null &&
                        gameState.board[row][col + 2] === null) {
                        gameState.board[row][col] = values[0];
                        gameState.board[row][col + 1] = values[1];
                        gameState.board[row][col + 2] = values[2];
                        placed++;
                        break;
                    }
                }
                if (placed >= 4) break;
            }
        }
    }
}

// 计算所有符合条件的组合数量
function countValidCombinations() {
    let count = 0;
    const found = new Set();
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            // 横着
            if (j <= BOARD_SIZE - 3) {
                const cells = [
                    { row: i, col: j },
                    { row: i, col: j + 1 },
                    { row: i, col: j + 2 }
                ];
                const values = cells.map(c => gameState.board[c.row][c.col]);
                if (isValidMultiplication(values[0], values[1], values[2])) {
                    const key = getCombinationKey(cells);
                    if (!found.has(key)) {
                        found.add(key);
                        count++;
                    }
                }
            }
            
            // 竖着
            if (i <= BOARD_SIZE - 3) {
                const cells = [
                    { row: i, col: j },
                    { row: i + 1, col: j },
                    { row: i + 2, col: j }
                ];
                const values = cells.map(c => gameState.board[c.row][c.col]);
                if (isValidMultiplication(values[0], values[1], values[2])) {
                    const key = getCombinationKey(cells);
                    if (!found.has(key)) {
                        found.add(key);
                        count++;
                    }
                }
            }
            
            // L型
            if (i < BOARD_SIZE - 1 && j < BOARD_SIZE - 1) {
                const lShapes = [
                    [
                        { row: i, col: j },
                        { row: i, col: j + 1 },
                        { row: i + 1, col: j }
                    ],
                    [
                        { row: i, col: j },
                        { row: i, col: j + 1 },
                        { row: i + 1, col: j + 1 }
                    ],
                    [
                        { row: i, col: j },
                        { row: i + 1, col: j },
                        { row: i + 1, col: j + 1 }
                    ],
                    [
                        { row: i, col: j },
                        { row: i + 1, col: j },
                        { row: i, col: j + 1 }
                    ]
                ];
                
                for (const cells of lShapes) {
                    const values = cells.map(c => gameState.board[c.row][c.col]);
                    if (isValidMultiplication(values[0], values[1], values[2]) ||
                        isValidMultiplication(values[0], values[2], values[1]) ||
                        isValidMultiplication(values[1], values[2], values[0])) {
                        const key = getCombinationKey(cells);
                        if (!found.has(key)) {
                            found.add(key);
                            count++;
                        }
                    }
                }
            }
        }
    }
    
    return count;
}

// 获取组合的唯一键
function getCombinationKey(cells) {
    const sorted = cells
        .map(c => `${c.row},${c.col}`)
        .sort()
        .join('|');
    return sorted;
}

// 渲染游戏板
function renderBoard() {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = gameState.board[i][j];
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // 检查是否在已选组合中
            if (isCellInSelectedCombination(i, j)) {
                cell.classList.add('matched');
            }
            
            // 检查是否在当前选择中
            if (isCellInCurrentSelection(i, j)) {
                cell.classList.add('selected');
            }
            
            cell.addEventListener('click', () => handleCellClick(i, j));
            boardElement.appendChild(cell);
        }
    }
}

// 检查单元格是否在已选组合中
function isCellInSelectedCombination(row, col) {
    for (const combo of gameState.selectedCombinations) {
        for (const cell of combo.cells) {
            if (cell.row === row && cell.col === col) {
                return true;
            }
        }
    }
    return false;
}

// 检查单元格是否在当前选择中
function isCellInCurrentSelection(row, col) {
    return gameState.currentSelection.some(
        cell => cell.row === row && cell.col === col
    );
}

// 处理单元格点击
function handleCellClick(row, col) {
    const cellIndex = gameState.currentSelection.findIndex(
        cell => cell.row === row && cell.col === col
    );
    
    if (cellIndex !== -1) {
        // 取消选择
        gameState.currentSelection.splice(cellIndex, 1);
    } else {
        // 添加选择
        if (gameState.currentSelection.length < 3) {
            gameState.currentSelection.push({ row, col });
        } else {
            // 如果已经有3个，替换第一个
            gameState.currentSelection.shift();
            gameState.currentSelection.push({ row, col });
        }
    }
    
    renderBoard();
    
    // 如果选择了3个，检查是否可以标记
    if (gameState.currentSelection.length === 3) {
        checkAndMark();
    }
}

// 检查三个数字是否能组成乘法口诀
function isValidMultiplication(a, b, c) {
    // 检查 a×b=c
    // 其中两个数字必须是1-9（乘数），第三个必须是它们的积（1-81，都在100以内）
    // 情况1: a和b是1-9，c是积
    if (a >= 1 && a <= 9 && b >= 1 && b <= 9 && a * b === c && c <= 100) {
        return true;
    }
    // 情况2: a和c是1-9，b是积（虽然不太可能，但为了完整性保留）
    if (a >= 1 && a <= 9 && c >= 1 && c <= 9 && a * c === b && b <= 100) {
        return true;
    }
    // 情况3: b和c是1-9，a是积（虽然不太可能，但为了完整性保留）
    if (b >= 1 && b <= 9 && c >= 1 && c <= 9 && b * c === a && a <= 100) {
        return true;
    }
    return false;
}

// 检查三个单元格是否连续（横、竖或L型）
function areCellsConnected(cells) {
    if (cells.length !== 3) return false;
    
    const [c1, c2, c3] = cells;
    
    // 检查是否在同一行（横着）
    if (c1.row === c2.row && c2.row === c3.row) {
        const cols = [c1.col, c2.col, c3.col].sort((a, b) => a - b);
        return cols[1] === cols[0] + 1 && cols[2] === cols[1] + 1;
    }
    
    // 检查是否在同一列（竖着）
    if (c1.col === c2.col && c2.col === c3.col) {
        const rows = [c1.row, c2.row, c3.row].sort((a, b) => a - b);
        return rows[1] === rows[0] + 1 && rows[2] === rows[1] + 1;
    }
    
    // 检查L型：三个单元格占据2x2区域的三个角
    const rows = [c1.row, c2.row, c3.row];
    const cols = [c1.col, c2.col, c3.col];
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    
    const rowDiff = maxRow - minRow;
    const colDiff = maxCol - minCol;
    
    if (rowDiff === 1 && colDiff === 1) {
        const corners = [
            { row: minRow, col: minCol },
            { row: minRow, col: maxCol },
            { row: maxRow, col: minCol },
            { row: maxRow, col: maxCol }
        ];
        
        let cornerCount = 0;
        for (const cell of cells) {
            for (const corner of corners) {
                if (cell.row === corner.row && cell.col === corner.col) {
                    cornerCount++;
                    break;
                }
            }
        }
        
        return cornerCount === 3;
    }
    
    return false;
}

// 检查并标记
function checkAndMark() {
    if (gameState.currentSelection.length !== 3) return;
    
    const cells = gameState.currentSelection;
    
    // 检查是否连续
    if (!areCellsConnected(cells)) {
        showMessage('三个数字必须连续（横、竖或L型）！', 'error');
        gameState.currentSelection = [];
        renderBoard();
        return;
    }
    
    // 获取三个数字
    const values = cells.map(cell => gameState.board[cell.row][cell.col]);
    const [a, b, c] = values;
    
    // 检查是否能组成乘法口诀
    if (!isValidMultiplication(a, b, c)) {
        showMessage(`这三个数字不能组成乘法口诀！`, 'error');
        gameState.currentSelection = [];
        renderBoard();
        return;
    }
    
    // 检查是否已经选择过这个组合
    const key = getCombinationKey(cells);
    const alreadySelected = gameState.selectedCombinations.some(
        combo => getCombinationKey(combo.cells) === key
    );
    
    if (alreadySelected) {
        showMessage('这个组合已经被选过了！', 'error');
        gameState.currentSelection = [];
        renderBoard();
        return;
    }
    
    // 可以标记
    gameState.selectedCombinations.push({
        cells: [...cells],
        values: [...values]
    });
    
    gameState.score++;
    updateScore();
    
    // 显示成功消息
    const formula = `${values[0]}×${values[1]}=${values[2]}`;
    showMessage(`找到组合：${formula}！已找到 ${gameState.selectedCombinations.length}/${gameState.totalCombinations}`, 'success');
    
    gameState.currentSelection = [];
    renderBoard();
    
    // 检查游戏是否结束
    checkGameOver();
}

// 检查游戏是否结束
function checkGameOver() {
    if (gameState.selectedCombinations.length >= gameState.totalCombinations) {
        setTimeout(() => {
            showMessage(`恭喜！游戏完成！你找到了所有 ${gameState.totalCombinations} 个组合！`, 'success');
            alert(`🎉 恭喜！游戏完成！\n你找到了所有 ${gameState.totalCombinations} 个组合！\n总积分：${gameState.score}`);
        }, 500);
    }
}

// 更新积分显示
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
    const comboElement = document.getElementById('combo');
    if (comboElement) {
        comboElement.textContent = `${gameState.selectedCombinations.length}/${gameState.totalCombinations}`;
    }
}

// 显示消息
function showMessage(text, type = '') {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = 'message' + (type ? ' ' + type : '');
    
    if (text) {
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'message';
        }, 3000);
    }
}

// 提示功能
function showHint() {
    // 找到一个未选中的组合并高亮
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            // 横着
            if (j <= BOARD_SIZE - 3) {
                const cells = [
                    { row: i, col: j },
                    { row: i, col: j + 1 },
                    { row: i, col: j + 2 }
                ];
                const values = cells.map(c => gameState.board[c.row][c.col]);
                if (isValidMultiplication(values[0], values[1], values[2])) {
                    const key = getCombinationKey(cells);
                    const alreadySelected = gameState.selectedCombinations.some(
                        combo => getCombinationKey(combo.cells) === key
                    );
                    if (!alreadySelected) {
                        highlightCells(cells);
                        return;
                    }
                }
            }
            
            // 竖着
            if (i <= BOARD_SIZE - 3) {
                const cells = [
                    { row: i, col: j },
                    { row: i + 1, col: j },
                    { row: i + 2, col: j }
                ];
                const values = cells.map(c => gameState.board[c.row][c.col]);
                if (isValidMultiplication(values[0], values[1], values[2])) {
                    const key = getCombinationKey(cells);
                    const alreadySelected = gameState.selectedCombinations.some(
                        combo => getCombinationKey(combo.cells) === key
                    );
                    if (!alreadySelected) {
                        highlightCells(cells);
                        return;
                    }
                }
            }
            
            // L型
            if (i < BOARD_SIZE - 1 && j < BOARD_SIZE - 1) {
                const lShapes = [
                    [
                        { row: i, col: j },
                        { row: i, col: j + 1 },
                        { row: i + 1, col: j }
                    ],
                    [
                        { row: i, col: j },
                        { row: i, col: j + 1 },
                        { row: i + 1, col: j + 1 }
                    ],
                    [
                        { row: i, col: j },
                        { row: i + 1, col: j },
                        { row: i + 1, col: j + 1 }
                    ],
                    [
                        { row: i, col: j },
                        { row: i + 1, col: j },
                        { row: i, col: j + 1 }
                    ]
                ];
                
                for (const cells of lShapes) {
                    const values = cells.map(c => gameState.board[c.row][c.col]);
                    if (isValidMultiplication(values[0], values[1], values[2]) ||
                        isValidMultiplication(values[0], values[2], values[1]) ||
                        isValidMultiplication(values[1], values[2], values[0])) {
                        const key = getCombinationKey(cells);
                        const alreadySelected = gameState.selectedCombinations.some(
                            combo => getCombinationKey(combo.cells) === key
                        );
                        if (!alreadySelected) {
                            highlightCells(cells);
                            return;
                        }
                    }
                }
            }
        }
    }
    
    showMessage('当前没有可选的组合了！', 'error');
}

// 高亮提示的单元格
function highlightCells(cells) {
    // 先清除之前的高亮
    document.querySelectorAll('.cell').forEach(cell => {
        cell.style.boxShadow = '';
    });
    
    cells.forEach(cell => {
        const cellElement = document.querySelector(
            `[data-row="${cell.row}"][data-col="${cell.col}"]`
        );
        if (cellElement) {
            cellElement.style.boxShadow = '0 0 15px #4caf50, 0 0 25px #4caf50';
        }
    });
    
    setTimeout(() => {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.style.boxShadow = '';
        });
    }, 2000);
    
    showMessage('已高亮提示可选的组合！', 'success');
}

// 事件监听
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('确定要重新开始游戏吗？')) {
        initGame();
    }
});

document.getElementById('hintBtn').addEventListener('click', showHint);

// 初始化游戏
initGame();
