// Learn TypeScript:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/typescript/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
const {ccclass, property} = cc._decorator;
const SIZE: number = 4;
const cellPos: cc.Vec2[][] =
    [
        [cc.p(-243, 243), cc.p(-81, 243), cc.p(81,243), cc.p(243,243)],
        [cc.p(-243, 81), cc.p(-81, 81), cc.p(81,81), cc.p(243,81)],
        [cc.p(-243, -81), cc.p(-81, -81), cc.p(81,-81), cc.p(243,-81)],
        [cc.p(-243, -243), cc.p(-81, -243), cc.p(81,-243), cc.p(243,-243)]
    ];

@ccclass
class Cell
{

    col: number;
    row: number;
    pos: cc.Vec2;
    val: number = 0;
    spriteNode: cc.Node;

    constructor (col: number, row: number, node: cc.Node, parent: cc.Node)
    {
        this.col = col;
        this.row = row;
        this.pos = cellPos[col][row];
        this.spriteNode = node;
        this.spriteNode.addComponent(cc.Sprite);
        this.spriteNode.parent = parent;
        this.spriteNode.position = cellPos[col][row];
    }
}

class SpriteCell
{
    sprite: cc.Node = null;
}

@ccclass
export default class Board extends cc.Component {

    @property
    minDistToSwipe: number = 80;
    
    @property
    moveDuration: number = 0.14;

    @property
    popDuration: number = 0.05;

    @property
    popScale: number = 1.2;

    @property(cc.Prefab)
    item: cc.Prefab = null;

    @property(cc.Node)
    parent: cc.Node = null;

    @property(cc.Node)
    gameOverNode: cc.Node = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Sprite)
    gauge: cc.Sprite = null;

    @property
    maxGaugeScore: number = 0;

    @property(cc.SpriteFrame)
    sprite: cc.SpriteFrame[] = [];

    initTouchPos: cc.Vec2 = null;
    movingTouchPos: cc.Vec2 = null;

    isSwiped: boolean = false;
    isSwipeBlocked: boolean = false;

    score: number = 0;
    offset: number = 162;

    board: Cell[][] = [[], [], [], []]
    

    // LIFE-CYCLE CALLBACKS:

    start ()
    {
        let self = this;
        self.makeBoard();
        self.spawnNewCell();
        self.spawnNewCell();
        self.drawAllCells();
        self.setScore(0);
        self.setGauge();


        self.node.on(cc.Node.EventType.TOUCH_START, function(event: cc.Event.EventTouch){
            if (!self.isSwipeBlocked)
            {
                let touches: cc.Event.EventTouch[] = event.getTouches();
                self.initTouchPos = touches[0].getLocation();
            }
        }, self.node)
        self.node.on(cc.Node.EventType.TOUCH_MOVE, function(event: cc.Event.EventTouch)
        {
            if (!self.isSwiped)
            {
                let touches: cc.Event.EventTouch[] = event.getTouches();
                self.movingTouchPos = touches[0].getLocation();
                
                let dist: cc.Vec2 = cc.pSub(self.movingTouchPos, self.initTouchPos);

                //★★★★★★★★ Swipe 로직 들어가는 곳 ★★★★★★★★

                //왼쪽
                if (dist.x <= -self.minDistToSwipe)
                {
                    self.isSwiped = true;
                    self.swipeLeft();
                    return;
                }
                //오른쪽
                if (dist.x > self.minDistToSwipe)
                {
                    self.isSwiped = true;
                    self.swipeRight();
                    return;
                }
                //아래쪽
                if (dist.y <= -self.minDistToSwipe)
                {
                    self.isSwiped = true;
                    self.swipeDown();
                    return;
                }
                //위쪽
                if (dist.y > self.minDistToSwipe)
                {
                    self.isSwiped = true;
                    self.swipeUp();
                    return;
                }
            }
            else
            {
                return;
            }
        }, self.node);
        self.node.on(cc.Node.EventType.TOUCH_END, function(event: cc.Event.EventTouch)
        {
            self.initTouchPos = null;
            self.movingTouchPos = null;
            self.isSwiped = false;
        }, self.node);
    }

    //board를 세팅한다.
    makeBoard(): void
    {
        for (let i = 0; i < SIZE; ++i)
        {
            for (let j = 0; j < SIZE; ++j)
            {
                let temp: cc.Node = cc.instantiate(this.item);
                this.board[i][j] = new Cell(i, j, temp, this.parent);
            }
        }
    }

    resetBoard(): void
    {
        for (let i = 0; i < SIZE; ++i)
            for (let j = 0; j < SIZE; ++j)
                this.board[i][j].val = 0;
        this.spawnNewCell();
        this.spawnNewCell();
        this.drawAllCells();
        this.score = 0;
        this.setScore(0);
        this.setGauge();
        this.gameOverNode.active = false;
    }

    //cell의 값에 맞는 이미지를 cell에 그려준다.
    drawCell(cell: Cell): void
    {
        switch(cell.val)
        {
            case 0: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = null; break;
            case 2: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = this.sprite[1]; break;
            case 4: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = this.sprite[2]; break;
            case 8: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = this.sprite[3]; break;
            case 16: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = this.sprite[4]; break;
            case 32: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = this.sprite[5]; break;
            case 64: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = this.sprite[6]; break;
            case 128: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = this.sprite[7]; break;
            case 256: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = this.sprite[8]; break;
            case 512: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = this.sprite[9]; break;
            case 1024: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = this.sprite[10]; break;
            case 2048: cell.spriteNode.getComponent(cc.Sprite).spriteFrame = this.sprite[11]; break;
        }
        cell.spriteNode.position = cellPos[cell.col][cell.row];
    }

    //board에 있는 모든 cell에 그려준다.
    drawAllCells(): void
    {
        for (let i = 0; i < SIZE; ++i)
            for (let j = 0; j < SIZE; ++j)
                this.drawCell(this.board[i][j]);
    }

    //board가 꽉 찼는지 확인한다.
    isBoardFull(): boolean
    {
        let count: number = 0;
        for (let i = 0; i < SIZE; ++i)
            for (let j = 0; j < SIZE; ++j)
                if (this.board[i][j].val == 0)
                    return false;
        
        return true;
    }

    //더 이상 움직일 블록이 없으면 true (게임오버 조건)
    hasPossibleMove(): boolean
    {
        for (let i = 0; i < SIZE; ++i)
        {
            if (this.board[i][0].val == this.board[i][1].val ||
                this.board[i][1].val == this.board[i][2].val ||
                this.board[i][2].val == this.board[i][3].val)
                return true;
        }
        for (let i = 0; i < SIZE; ++i)
        {
            if (this.board[0][i].val == this.board[1][i].val ||
                this.board[1][i].val == this.board[2][i].val ||
                this.board[2][i].val == this.board[3][i].val)
                return true;
        }

        return false;
    }

    gameOver(): void
    {
        this.gameOverNode.active = true;
    }

    //새로운 item을 만든다.
    spawnNewCell(): void
    {
        while (true)
        {
            let randX: number = Math.floor(Math.random() * SIZE);
            let randY: number = Math.floor(Math.random() * SIZE);
            if (!this.board[randX][randY].val)
            {
                if (Math.random() < 0.8)
                    this.board[randX][randY].val = 2;
                else
                    this.board[randX][randY].val = 4;
                break;
            }
            else
                continue;
        }
    }

    //더이상 움직일 블록이 없는지 확인 (보드가 꽉 찼을 때만 검사)
    checkGameOver(): void
    {
        if (this.isBoardFull())
        {
            if (!this.hasPossibleMove())
            {
                this.gameOver()
                return;
            }
            else
                return;
        }
    }

    releaseSwipeBlock(): void
    {
        this.isSwipeBlocked = false;
    }

    //보드에 움직일 것이 있을 때 수행
    procBoard(): void
    {
        this.isSwipeBlocked = true;
        this.scheduleOnce(this.releaseSwipeBlock, this.moveDuration);
        this.spawnNewCell();
        this.scheduleOnce(this.drawAllCells, this.moveDuration);
        this.checkGameOver();
    }

    //디버깅용
    spawnCustomCell(col: number, row: number, val: number): void
    {
        this.board[col][row].val = val;
    }

    setScore(score: number): void
    {
        this.score += score;
        this.scoreLabel.string = this.score.toString();
    }

    setGauge(): void
    {
        this.gauge.fillRange = this.score / this.maxGaugeScore;
    }

    moveCellAction(cell: cc.Node, moveBy: cc.Vec2): void
    {
        let moveAction: cc.Action = cc.moveBy(0.14, moveBy);
        cell.runAction(moveAction);
    }

    // popCellAction(cell: cc.Node): void
    // {
    //     let scaleInc: cc.FiniteTimeAction[] = [cc.scaleBy(this.popDuration, this.popScale, this.popScale),
    //                                             cc.scaleBy(this.popDuration, 1, 1)];
    //     let sequenceAction: cc.Action = cc.sequence(scaleInc);
    //     cell.runAction(sequenceAction);
    // }

    swipeLeft(): void
    {
        let isMoved: boolean = false;
        // let isCombined: boolean = false;
        for (let i = 0; i < SIZE; ++i)
        {
            let lim: number = 0;
            for (let j = 1; j < SIZE; ++j)
            {
                if (this.board[i][j].val == 0)
                    continue;
                let moveBy: cc.Vec2 = cc.p(0, 0);
                for (let k = j - 1; k >= lim; --k)
                {
                    if (this.board[i][k].val == 0)
                    {
                        this.board[i][k].val = this.board[i][k+1].val;
                        this.board[i][k+1].val = 0;
                        moveBy.x -= this.offset;
                        isMoved = true;
                    }
                    else
                    {
                        if (this.board[i][k].val == this.board[i][k+1].val)
                        {
                            let temp: number = this.board[i][k].val * 2;
                            this.board[i][k].val = temp;
                            this.setScore(temp);
                            this.setGauge();
                            this.board[i][k+1].val = 0;
                            moveBy.x -= this.offset;
                            isMoved = true;
                            lim = k + 1;
                            break;
                        }
                        else
                        {
                            break;
                        }
                    }
                }
                this.moveCellAction(this.board[i][j].spriteNode, moveBy);
            }
        }
        if (isMoved)
        {
            this.procBoard();
        }
        else
            return;
    }

    swipeRight(): void
    {
        let isMoved: boolean = false;
        for (let i = 0; i < SIZE; ++i)
        {
            let lim: number = SIZE;
            for (let j = SIZE - 2; j >= 0; --j)
            {
                if (this.board[i][j].val == 0)
                    continue;
                let moveBy: cc.Vec2 = cc.p(0, 0);
                for (let k = j + 1; k < lim; ++k)
                {
                    if (this.board[i][k].val == 0)
                    {
                        this.board[i][k].val = this.board[i][k-1].val;
                        this.board[i][k-1].val = 0;
                        moveBy.x += this.offset;
                        isMoved = true;
                    }
                    else
                    {
                        if (this.board[i][k].val == this.board[i][k-1].val)
                        {
                            let temp: number = this.board[i][k].val * 2;
                            this.board[i][k].val = temp;
                            this.setScore(temp);
                            this.setGauge();
                            this.board[i][k-1].val = 0;
                            moveBy.x += this.offset;
                            isMoved = true;
                            lim = k;
                            break;
                        }
                        else
                        {
                            break;
                        }
                    }
                }
                this.moveCellAction(this.board[i][j].spriteNode, moveBy);
            }
        }
        if (isMoved)
        {
            this.procBoard();
        }
        else
            return;
    }

    swipeUp(): void
    {
        this.node.stopAllActions();
        let isMoved: boolean = false;
        for (let i = 0; i < SIZE; ++i)
        {
            let lim: number = 0;
            for (let j = 1; j < SIZE; ++j)
            {
                if (this.board[j][i].val == 0)
                    continue;
                let moveBy: cc.Vec2 = cc.p(0, 0);
                for (let k = j - 1; k >= lim; --k)
                {
                    if (this.board[k][i].val == 0)
                    {
                        this.board[k][i].val = this.board[k+1][i].val;
                        this.board[k+1][i].val = 0;
                        moveBy.y += this.offset;
                        isMoved = true;
                    }
                    else
                    {
                        if (this.board[k][i].val == this.board[k+1][i].val)
                        {
                            let temp: number = this.board[k][i].val * 2;
                            this.board[k][i].val = temp;
                            this.setScore(temp);
                            this.setGauge();
                            this.board[k+1][i].val = 0;
                            moveBy.y += this.offset;
                            isMoved = true;
                            lim = k + 1;
                            break;
                        }
                        else
                        {
                            break;
                        }
                    }
                }
                this.moveCellAction(this.board[j][i].spriteNode, moveBy);
            }
        }
        if (isMoved)
        {
            this.procBoard();
        }
        else
            return;
    }

    swipeDown(): void
    {
        let isMoved: boolean = false;
        for (let i = 0; i < SIZE; ++i)
        {
            let lim: number = SIZE;
            for (let j = SIZE - 2; j >= 0; --j)
            {
                if (this.board[j][i].val == 0)
                    continue;
                let moveBy: cc.Vec2 = cc.p(0, 0);
                for (let k = j + 1; k < lim; ++k)
                {
                    if (this.board[k][i].val == 0)
                    {
                        this.board[k][i].val = this.board[k-1][i].val;
                        this.board[k-1][i].val = 0;
                        moveBy.y -= this.offset;
                        isMoved = true;
                    }
                    else
                    {
                        if (this.board[k][i].val == this.board[k-1][i].val)
                        {
                            let temp: number = this.board[k][i].val * 2;
                            this.board[k][i].val = temp;
                            this.setScore(temp);
                            this.setGauge();
                            this.board[k-1][i].val = 0;
                            moveBy.y -= this.offset;
                            isMoved = true;
                            lim = k;
                            break;
                        }
                        else
                        {
                            break;
                        }
                    }
                }
                this.moveCellAction(this.board[j][i].spriteNode, moveBy);
            }
        }
        if (isMoved)
        {
            this.procBoard();
        }
        else
            return;
    }

}