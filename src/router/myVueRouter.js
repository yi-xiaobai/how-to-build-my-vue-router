
let Vue


// 路由中需要存放当前的路径，来表示当前的路径状态
class HistoryRoute {
    constructor() {
        this.current = null
    }
}

class VueRouter {
    constructor(options) {
        this.mode = options.mode
        this.routes = options.routes
        this.routesMap = this.createMap(this.routes)
        // console.log('==>Get this.routesMap', this.routesMap);

        this.history = new HistoryRoute()

        // 初始化
        this.init()
    }


    createMap(routes) {
        return routes.reduce((map, item) => {
            map[item.path] = item.component
            return map
        }, {})
    }



    init() {
        // mode是hash模式
        if (this.mode === 'hash') {
            console.log('hash');
            location.hash ? '' : location.hash = '#/'

            window.addEventListener('load', () => {
                console.log('loaded');
                this.history.current = location.hash.slice(1)
            })

            window.addEventListener('hashchange', () => {
                this.history.current = location.hash.slice(1)
            })
        }
        // history模式
        else {
            location.pathname ? '' : location.pathname = '/'

            window.addEventListener('load', () => {
                this.history.current = location.pathname
            })

            window.addEventListener('popState', () => {
                this.history.current = location.pathname
            })
        }
    }

}
VueRouter.install = function (_Vue) {
    Vue = _Vue

    Vue.mixin({
        beforeCreate() {
            // console.log('==>Get this', this.$options);
            if (this.$options && this.$options.router) {
                this._root = this
                this.router = this.$options.router
                Vue.util.defineReactive(this, '_route', this.router.history.current)
            } else {
                this._root = this.$parent && this.$parent._root
            }
            // 将$router属性绑定到Vue上
            Object.defineProperty(this, '$router', {
                get() {
                    return this._root.router
                }
            })

            // 完善route
            Object.defineProperty(this, '$route', {
                get() {
                    return this._root._route
                }
            })
        }
    })


    Vue.component('router-link', {
        props: {
            to: String
        },
        render(h) {
            console.log('==>Get this.$slots', this.$slots);
            // 当前模式
            const mode = this._root.router.mode
            const path = mode === 'hash' ? '#' + this.to : this.to
            return h('a', { attrs: { href: path } }, this.$slots.default)
        }
    })


    Vue.component('router-view', {
        render(h) {
            // 当前路径
            const current = this._root.router.history.current
            console.log('11', current);
            // 获取映射表
            const routesMap = this._root.router.routesMap
            console.log('==>Get routesMap[current]', routesMap[current]);
            return h(routesMap[current])
        }
    })
}


// 这里一定要记得导出
export default VueRouter