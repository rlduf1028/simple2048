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
const cellPos: cc.Vec2[][] =
    [
        [cc.p(-369, 369), cc.p(-123, 369), cc.p(123,369), cc.p(369,369)],
        [cc.p(-369, 123), cc.p(-123, 123), cc.p(123,123), cc.p(369,123)],
        [cc.p(-369, -123), cc.p(-123, -123), cc.p(123,-123), cc.p(369,-123)],
        [cc.p(-369, -369), cc.p(-123, -369), cc.p(123,-369), cc.p(369,-369)]
    ];

@ccclass
export default class Cell extends cc.Component
{
    col: number;
    row: number;
    pos: cc.Vec2;
    val: number = 0;
    spriteNode: cc.Node;

    construct(col: number, row: number, parent: cc.Node): void
    {
        this.col = col;
        this.row = row;
        this.pos = cellPos[col][row];
        this.spriteNode = new cc.Node();
        this.spriteNode.addComponent(cc.Sprite);
        this.spriteNode.addComponent(cc.Animation);
        this.spriteNode.parent = parent;
        this.spriteNode.position = cellPos[col][row];
    }
}