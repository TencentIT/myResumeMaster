function SlideMenu (id) {
    //所有菜单div的集合
    this.menuDivs = document.getElementById(id).children;
    //指定单元移动的距离
    this.itemMove = 8;
    //是否只能打开一个
    this.oneOnly = false;
    //是否保存状态
    this.saveState = true;
}

/**
 * 给原型对象添加一个init()
 * 给所有<span>绑定点击监听
 */
SlideMenu.prototype.init = function () {
    //this是SlideMenu的实例对象sm
    var sm = this;
    for(var i=0,length=this.menuDivs.length;i<length;i++) {
        this.menuDivs[i].children[0].onclick = function () {
            //切换菜单div的状态
            //this是<span>
            sm.toggleMenu(this.parentNode);
        };
    }
    //读取保存的菜单状态
    this.readMenuState();
};

/*
 * 切换指定菜单div的状态
 */
SlideMenu.prototype.toggleMenu = function (menuDiv) {
    if(menuDiv.className=='collapsed') {
        this.expandMenu(menuDiv);
    } else {
        this.collapseMenu(menuDiv);
    }
};

/*
 * 展开指定菜单div
 *
 * menuDiv.offsetHeight
 * menuDiv.style.height
 * openedHeight(最终打开时的高度)
 * itemMove(每个单元扩大的值)
 * intervalTime(单元扩大的间隔时间)
 */
SlideMenu.prototype.expandMenu = function (menuDiv) {
    var sm = this;
    //计算出最终打开时的高度(所有子标签的高度的和)
    var openedHeight = 0;
    var submenuEles = menuDiv.children;
    for(var i=0,length=submenuEles.length;i<length;i++) {
        openedHeight += submenuEles[i].offsetHeight;
    }
    //itemMove(每个单元扩大的值)
    var itemMove = this.itemMove;
    //intervalTime(单元扩大的间隔时间)
    var intervalTime = 20;
    //设置定时器
    var intervalId = setInterval(function () {
        var height = menuDiv.offsetHeight + itemMove;
        if(height>=openedHeight) {
            //移除定时器
            clearInterval(intervalId);
            menuDiv.className = ''; //让css样式失效
            menuDiv.style.height = ''; //不考虑内联的样式高度

            //保存状态
            sm.saveMenuState();
        } else {
            menuDiv.style.height = height + "px";
        }
    }, intervalTime);

    //关闭其他菜单
    this.collapseOtherMenu(menuDiv);
};

/*
 * 收缩指定菜单div
 */
SlideMenu.prototype.collapseMenu = function (menuDiv) {
    var sm = this;
    //关闭时的高度(span的高度)
    var closedHeight = 0;
    closedHeight = menuDiv.children[0].offsetHeight;
    //itemMove(每个单元扩大的值)
    var itemMove = -this.itemMove;
    //intervalTime(单元扩大的间隔时间)
    var intervalTime = 20;
    //设置定时器
    var intervalId = setInterval(function () {
        var height = menuDiv.offsetHeight + itemMove;
        if(height<=closedHeight) {
            //移除定时器
            clearInterval(intervalId);
            menuDiv.className = 'collapsed';
            menuDiv.style.height = ''; //不考虑内联的样式高度

            //保存状态
            sm.saveMenuState();
        } else {
            menuDiv.style.height = height + "px";
        }
    },intervalTime);
};

/*
 * 关闭其它打开的menu div
 */
SlideMenu.prototype.collapseOtherMenu = function (menuDiv) {
    if(this.oneOnly) {
        for(var i=0,length=this.menuDivs.length;i<length;i++) {
            //得到某个menu div
            var md = this.menuDivs[i];
            if(md.className!="collapsed" && md!=menuDiv) {
                //关闭菜单
                this.collapseMenu(md);
            }
        }
    }
};

/**
 *	保存菜单的状态
 *  slidemenu=0100;expires=30天后的时间值
 */
SlideMenu.prototype.saveMenuState = function () {
    if(!this.saveState) {
        return;
    }

    //组拼状态字符串
    var states = [];  //[0, 1, 0, 0]
    for(var i=0,length=this.menuDivs.length;i<length;i++) {
        if(this.menuDivs[i].className=='collapsed') {
            states.push(0);
        } else {
            states.push(1);
        }
    }
    //时间
    var date = new Date();
    date.setTime(date.getTime()+1000*60*60*24*30);

    //拼接成cookie字符串
    var cookieStr = 'slidemenu='+states.join('')+';expires='+date.toUTCString();

    //保存到cookie
    document.cookie = cookieStr;

};

SlideMenu.prototype.readMenuState = function () {
    if(!this.saveState) {
        return;
    }

    //读取cookie      //slidemenu=0100;username=tom
    var cookie = document.cookie;
    //取出slidemenu为key的cookie值
    var reg = /slidemenu=(\d+)/;
    var matches = reg.exec(cookie); //[slidemenu=0100, 0100]
    if(matches!=null) {
        var states = matches[1].split('');// '0100'--->[0, 1, 0, 0]
        for(var i=0;i<states.length;i++) {
            //根据state值确定className
            this.menuDivs[i].className = states[i]==0 ? 'collapsed' : '';
        }
    }
};