var ImpressumPopup = function(data) {
    
    this.initialize = function(data) {
        this.el = $("<div/>").addClass("page");
        this.registerEvents();
        this.data = data;
    };
    
    this.setScroll = function() {
        var self = this;
        if (self.myscroll) {
            setTimeout(function(){self.myscroll.refresh();}, 0);
        } else {
            setTimeout(function(){self.myscroll = new IScroll($('.popup-content', self.el)[0], {
                useTransform: true,
                zoom: false,
                onBeforeScrollStart: function (e) {
                var target = e.target;
                while (target.nodeType != 1) target = target.parentNode;
                
                if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
                e.preventDefault();
                }
            });}, 500);
        }  
    };
    
    this.render = function() {
        this.el.html(ImpressumPopup.template(this.data));
        this.setScroll();
        return this;
    };
    
    this.registerEvents = function() {
        this.el.on("click", ".popup-close", function(){app.closePopup();});
    };
    
    this.initialize(data);
}
    
ImpressumPopup.template = Handlebars.compile($("#impressum-tpl").html());