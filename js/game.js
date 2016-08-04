/**
 * Created by likai on 16/7/26.
 */

(function($){
    var game = {};
    var bpic = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII=';
    game.init = function(){
        var mydom = $('#my-container');
        var my = new scene(mydom);
        $('#btn-panel').click(function(){
            my.addAirPlane();
        });
    };

    /**
     * 场景
     * @param dom 容器
     */
    function scene(dom){
        this.dom = dom;
        this.aps = new Array();
        this.isInit = false;
        this.maxX = 10;
        this.maxY = 10;
        this.cells = new Array(this.maxY);
        this.init();
    }

    scene.prototype.init = function(){
        var self = this;
        if(this.isInit)return;

        for(var i=0;i<this.maxY;i++){
            this.cells[i] = new Array(this.maxX);
            for(var j=0;j<this.maxX;j++){
                var cell = $('<div class="cell"><img src="'+bpic+'"></div>');
                cell.data('x',j);
                cell.data('y',i);
                cell.on('tap',function(event){
                    self.cellTap(event,this);
                });
                this.cells[i][j] = cell;
                this.dom.append(cell);
            }
        }
        this.apMoveHander(this.cells);
        this.isInit = true;
    };

    scene.prototype.domAddId = function(cell,id){
        debugger
        var apid = ($(cell).data('ap-id')||'').split(',');
        if(!apid){
            apid = [];
        }
        for(var i=0;i<apid.length;i++){
            if(parseInt(apid[i])==id){
                return;
            }
        }
        apid.push(id);
        $(cell).data('ap-id',apid.join(','));
    };

    scene.prototype.domSupId = function(cell,id){
        var apid = ($(cell).data('ap-id')||'').split(',');
        if(!apid){
            apid = [];
        }
        var subindex = -1;
        for(var i=0;i<apid.length;i++){
            if(apid[i]==id){
                subindex = i;
                break;
            }
        }
        if(subindex!=-1)
        apid.splice(subindex,1);
        $(cell).data('ap-id',apid.join(','));
    };

    scene.prototype.domIsInId = function(cell,id){
        var apid = ($(cell).data('ap-id')||'').split(',');
        if(!apid){
            apid = [];
        }
        for(var i=0;i<apid.length;i++){
            if(apid[i]==id){
                return true;
            }
        }
        return false;
    };

    scene.prototype.domGetId = function(cell){
        var apid = ($(cell).data('ap-id')||'').split(',');
        if(!apid){
            apid = [];
        }
        if(apid.length>0)return apid[0];
        return -1;
    };

    scene.prototype.domIsFlag = function(cell){
        var apid = ($(cell).data('ap-id')||'').split(',');
        if(!apid){
            apid = [];
        }
        return apid.length>0;
    };

    scene.prototype.apMoveHander = function(cells) {
        var bPosition = false;
        var ePosition = false;
        var isMove = false;
        var apid = false;
        var self = this;

        self.dom.on('touchstart', function (event) {
            var cell = $(event.target).parent('.cell');
            if ($(cell).is('.ap')) {
                var x = $(cell).data('x');
                var y = $(cell).data('y');
                bPosition = {'x':x,'y':y};
                apid = self.domGetId(cell);
                isMove = true;
            }
        });

        self.dom.on('touchmove',function(event){
            if (isMove) {
                var touch = event.touches[0];
                var touchx = touch.pageX;
                var touchy = touch.pageY;
                var cell = false;
                for(var i=0;i<self.cells.length;i++){
                    for(var j=0;j<self.cells[i].length;j++){
                        var c = $(self.cells[i][j]);
                        var p = c.position();
                        if(touchx> p.left && touchx< p.left+ c.width() && touchy> p.top && touchy< p.top+ c.height()){
                            cell = c;
                            break;
                        }
                    }
                }
                if(!cell){
                    return false;
                }
                var x = $(cell).data('x');
                var y = $(cell).data('y');
                ePosition = {'x': x, 'y': y};
                if(ePosition.x==bPosition.x && ePosition.y==bPosition.y){
                    return false;
                }
                //console.log(1)
                //console.log(ePosition);
                //console.log(bPosition);
                var ap = self.aps[apid];
                for (var i = 0; i < ap.points.length; i++) {
                    var point = ap.points[i];
                    self.domAddId(self.cells[point[1]][point[0]],ap.id);
                    //self.cells[point[1]][point[0]].removeClass('ap').data('ap-id',false);
                }
                ap.move(ePosition.x - bPosition.x, ePosition.y - bPosition.y);
                for (var i = 0; i < ap.points.length; i++) {
                    var point = ap.points[i];
                    self.domAddId(self.cells[point[1]][point[0]],ap.id);
                    //self.cells[point[1]][point[0]].addClass('ap').data('ap-id', ap.id);
                }
                self.drawApPoints();
                bPosition = {'x': x, 'y': y};
            }
            return false;
        });

        self.dom.on('touchend', function () {
            if (isMove) {
                isMove = false;
            }
        });

    };

    scene.prototype.drawApPoints = function(){
        this.dom.find('.cell.ap').removeClass('ap');
        for(var i=0;i<this.aps.length;i++){
            for(var j=0;j<this.aps[i].points.length;j++){
                var point = this.aps[i].points[j];
                this.cells[point[1]][point[0]].addClass('ap');
            }
        }
    };

    scene.prototype.cellTap = function(event,cell){
        var self = this;
        if($(cell).is('.ap')){
            var apid = $(cell).data('ap-id')[0];
            var ap = self.aps[apid];
            for(var i=0;i<ap.points.length;i++){
                var point = ap.points[i];
                self.domSupId(self.cells[point[1]][point[0]],ap.id);
                this.cells[point[1]][point[0]].removeClass('ap').data('ap-id',false);
            }
            ap.changeDirection();
            for(var i=0;i<ap.points.length;i++){
                var point = ap.points[i];
                self.domAddId(self.cells[point[1]][point[0]],ap.id);
                //this.cells[point[1]][point[0]].addClass('ap').data('ap-id',ap.id);
            }
            self.drawApPoints();
        }
    };

    scene.prototype.addAirPlane = function(){
        var self = this;
        var ap = new airplane(this,this.aps.length);
        for(var i=0;i<ap.points.length;i++){
            var point = ap.points[i];
            self.domAddId(self.cells[point[1]][point[0]],ap.id);
            //this.cells[point[1]][point[0]].addClass('ap').data('ap-id',ap.id);
        }

        this.aps.push(ap);
        self.drawApPoints();
    };
    /**
     * 飞机
     * @param scene 场景
     */
    function airplane(scene,id,position,direction){
        this.scene = scene;
        this.id = id;
        if(typeof(position)!='undefined'){
            this.position = position;
        }else{
            this.position = {'x':0,'y':0};
        }
        if(typeof(direction)!='undefined'){
            this.direction = direction;
        }else{
            this.direction = airplane.direction.left;
        }
        this.init();
    }

    airplane.prototype.init = function(){
        var self = this;
        self.makePoints();

    };

    airplane.prototype.changeDirection = function(){
        var self = this;
        self.direction++;
        if(self.direction>3)self.direction=0;
        self.makePoints();
    };
    airplane.prototype.move = function(xSpan,ySpan){
        var self = this;
        this.position.x+=xSpan;
        this.position.y+=ySpan;
        self.makePoints();
    };

    airplane.prototype.isInPoints = function(x,y){
        for(var i=0;i<this.points.length;i++){
            if(this.points[i][0]==x && this.points[i][1]==y){
                return true;
            }
        }
        return false;
    };

    airplane.prototype.makePoints = function(lx,ly){
        var self = this;
        self.direPoints = airplane.points[self.direction];
        self.points = new Array();
        for(var i=0;i<airplane.points[self.direction].length;i++) {
            var x = airplane.points[self.direction][i][0] + self.position.x;
            var y = airplane.points[self.direction][i][1] + self.position.y;
            if (x < 0) {
                if (typeof(lx) != 'undefined' && typeof(ly) != 'undefined' &&
                    (lx != self.position.x || ly != self.position.y)
                ) {
                    self.position.x = lx;
                    self.position.y = ly;
                } else {
                    self.position.x++;
                }
                self.makePoints();
                return;
            }
            if (x >= self.scene.maxX) {
                if (typeof(lx) != 'undefined' && typeof(ly) != 'undefined' &&
                    (lx != self.position.x || ly != self.position.y)
                ) {
                    self.position.x = lx;
                    self.position.y = ly;
                } else {
                    self.position.x--;
                }
                self.makePoints();
                return;
            }
            if (y < 0) {
                if (typeof(lx) != 'undefined' && typeof(ly) != 'undefined' &&
                    (lx != self.position.x || ly != self.position.y)
                ) {
                    self.position.x = lx;
                    self.position.y = ly;
                } else {
                    self.position.y++;
                }
                self.makePoints();
                return;
            }
            if (y >= self.scene.maxY) {
                if (typeof(lx) != 'undefined' && typeof(ly) != 'undefined' &&
                    (lx != self.position.x || ly != self.position.y)
                ) {
                    self.position.x = lx;
                    self.position.y = ly;
                } else {
                    self.position.y--;
                }
                self.makePoints();
                return;
            }
            self.points.push([x, y]);
        }
    };




    /**
     * 方向字典
     * @type {{left: number, top: number, right: number, bottom: number}}
     */
    airplane.direction = {
        'left':0,
        'top':1,
        'right':2,
        'bottom':3
    };

    airplane.pointStr = [
        '  *  '+'\n'+
        '*****'+'\n'+
        '  *  '+'\n'+
        ' *** ',

        ' *  '+'\n'+
        ' * *'+'\n'+
        '****'+'\n'+
        ' * *'+'\n'+
        ' *  ',

        ' *** '+'\n'+
        '  *  '+'\n'+
        '*****'+'\n'+
        '  *  ',

        '  * '+'\n'+
        '* * '+'\n'+
        '****'+'\n'+
        '* * '+'\n'+
        '  * '
    ];

    airplane.init = function(){
        airplane.points = [];

        for(var i=0;i<airplane.pointStr.length;i++){
            var dir = new Array();
            var dirStrs = airplane.pointStr[i].split('\n');
            for(var j=0;j<dirStrs.length;j++){
                for(var k=0;k<dirStrs[j].length;k++){
                    if(dirStrs[j].substr(k,1)=='*'){
                        dir.push([k,j]);
                    }
                }
            }
            airplane.points.push(dir);
        }
    }




    $(function(){
        airplane.init();
        game.init();
    });


})(Zepto);
