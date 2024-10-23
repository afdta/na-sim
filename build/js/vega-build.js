import {select, pointer} from 'd3-selection';
import {View, parse} from 'vega';


//formerly vview
function vega_build({
    spec = {},
    container = document.body, 
    callback = null,
    tooltip_width = 225,
    download = false,
    download_svg = false,
    file_name = download_svg ? "Chart.svg" : "Chart.png",
    theme = vega_theme(),
    mouseover = () => {console.log("mouseover")},
    mouseout = () => {console.log("mouseout")}
} = {}){

    //outer wrapper
    let container_ = select(container).style("position","relative")
                        .append("div").style("position","relative")
                        .style("padding","0px").style("margin","0px");

    //title
    
    //vega wrapper
    let v_wrap = container_.append("div").style("padding","0px").style("margin","0px");
    
    //tooltip 
    //sits in outer
    let tooltip_wrap = container_.append("div").style("position","absolute").style("display","none")
                        .style("width", (tooltip_width + "px")).classed("v-tooltip",true);

    let link = container_.append("div")
                    .style("position","absolute")
                    .style("top","100%")
                    .style("right","15px")
                    .append("p")
                    .style("font-style","italic")
                    .style("margin","5px 0px")
                    .style("text-align","right")
                    .classed("chart-download-link",true)
                    .append("a").text("Download graphic »")
                    .style("border","none")
                    .style("border-width","0px")
                    .style("text-decoration","none")
                    .style("font-size","13px")
                    .style("color","#555555")
                    .style("display", download ? "inline" : "none")
                    .node()
                    ;

    let vega_node = v_wrap.node();
    let v_view = new View(parse(spec, theme));

    v_view.hover()
        .initialize(vega_node)
        .renderer("svg")
        .tooltip(tip_handler)
        .runAsync()
        .then(function(){
            if(typeof callback === "function"){
                callback.call(vega_node, v_view);
            }

            if(download){toURL();}
        })
        ;

    let tip_timer;
    //https://vega.github.io/vega/docs/api/view/#view_tooltip
    function tip_handler(handler, event, item, values_array){
        clearTimeout(tip_timer);

        console.log("mouseover");
        let ev = {event: event}
        ev.node = container_.node();
        ev.xy = pointer(event, ev.node);
        
        let box = ev.node.getBoundingClientRect();
        let xpct = ev.xy[0]/(box.right-box.left);

        if(values_array != null){
            mouseover.call(ev, values_array);
            tooltip_wrap
                .style("left", xpct <= .50 ? Math.round(ev.xy[0] + 25) + "px" : Math.round(ev.xy[0] - 25 - tooltip_width) + "px")
                .style("top",Math.round(ev.xy[1] - 15)+"px")
                .style("display","block");
        }
        else{
            tip_timer = setTimeout(function(){
                mouseout.call(ev);
                tooltip_wrap.style("display","none");
            }, 50);
        } 
     
    }

    function toURL(){
        link.setAttribute('target','_blank');
        link.style.visibility = 'hidden';
        link.setAttribute('download', file_name);

        if(download_svg){
            v_view.toSVG().then(function(svg){
                let blob = new Blob([svg], {"type":"image/svg+xml"});
                link.setAttribute('href', URL.createObjectURL(blob));
                link.style.visibility = 'visible';
            });
        }
        else{
            v_view.toImageURL('png').then(function(url){
                link.setAttribute('href', url);
                link.style.visibility = 'visible';
            });
        }
    }

    //methods
    let M = {};

    M.mouseover = (fn) => {mouseover = fn;}
    M.mouseout = (fn) => {mouseout = fn;}

    M.dom = function(){
        return {
            tooltip: tooltip_wrap.node()
        }
    }

    M.signal = function(signal, value){
        v_view.resize();
        v_view.signal(signal, value).runAsync();
    }

    return M;

    
} //end vega build

//generate a theme
function vega_theme({
    fontFamily = "'Barlow', serif",
    fontSize = 16,
    fontColor = "#191919"
} = {}){
    let theme = {
        "text":{
            "font": fontFamily,
            "fontSize": fontSize,
            "fill": fontColor
            },
        "legend":{
            "layout":{
                "anchor": "middle",
                "margin":45
                },
            "titleFontWeight": "700",
            "titleColor": fontColor,
            "labelColor": fontColor,
            "titleFont": fontFamily,
            "titleFontSize": fontSize + 3,
            "labelFont": fontFamily,
            "labelFontSize": fontSize + 3,
            "columnPadding":20
            },
        "axis":{
            "labelFont": fontFamily,
            "labelFontSize": fontSize,
            "labelColor": fontColor,
            "titleColor": fontColor,
            "titleFontWeight":"700",
            "titleFontSize":fontSize,
            "titlePadding":20
        },
        "title":{
            "align":"left",
            "orient":"top",
            "anchor":"start",
            "fontSize":fontSize + 5,
            "offset":fontSize + 5,
            "subtitlePadding":10,
            "subtitleFontSize":fontSize + 4,
            "frame":"group"
        }
    }
    
    return theme;
}

export {vega_build, vega_theme}