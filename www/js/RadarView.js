var RadarView = function() {
    
    this.initialize = function() {
        this.el = $("<div/>").addClass("page");
        this.basePosition = "left";
    };
    
    this.render = function() {
        this.el.html(RadarView.template());
        return this;
    };
    
    this.initialize();
}
    
RadarView.template = Handlebars.compile($("#radar-tpl").html());
