let width = parseInt(d3.select("#scatter").style("width"));

let height = width - width / 4.0

let margin = 20

let labelArea = 110;

let textPaddingBottom = 40;
let textPaddingLeft = 40;

let svg = d3
         .select("#scatter")
         .append("svg")
         .attr("width", width)
         .attr("height", height)
         .attr("class", "chart")


let circleRadius;
function circleGetRadius(){
    if(width <= 530){
        circleRadius = 5;
    }
    else {
        circleRadius = 10;
    }
}

circleGetRadius()

svg.append("g").attr("class", "xaxisText")
let xaxisText = d3.select(".xaxisText")

function xaxisTextRefresh(){
    xaxisText.attr("transform", `translate(${(width - labelArea)/ 2 + labelArea}, ${height - margin - textPaddingBottom})`)
}
xaxisTextRefresh()

xaxisText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "activeText active x")
    .text("In Poverty (%)")

xaxisText
    .append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "activeText inactive x")
    .text('Age (Media)')

    
xaxisText
    .append("text")
    .attr("y", 26)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "activeText inactive x")
    .text('Household Income (Media)')


let leftTextX = margin + textPaddingLeft
let leftTextY = (height + labelArea) / 2 - labelArea

svg.append("g").attr("class", "yaxisText")

let yaxisText = d3.select(".yaxisText")

function yaxisTextRefresh(){
    yaxisText.attr("transform", `translate(${leftTextX}, ${leftTextY}) rotate(-90)`)
}
yaxisTextRefresh()


yaxisText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "activeText active y")
    .text("Obese (%)")

yaxisText
    .append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "activeText inactive y")
    .text("Smokes (%)")

yaxisText
    .append("text")
    .attr("y", 26)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "activeText inactive y")
    .text("Lack Healthcare (%)")


function visualize(data){
    let currentX = "poverty"
    let currentY = "obesity"

    let xMin
    let xMax
    let yMin
    let yMax 

    let toolTip = d3
                .tip()
                .attr("class", "d3-tip")
                .offset([40,-60])
                .html(function(data){
                    let theX
                    let theState = `<div>${data.state}</div>`
                    let theY = `<div>${currentY}:${data[currentY]}%</div>`
                    if(currentY === "poverty"){
                        theX = `<div>${currentX}:${data[currentX]}</div>`
                    }
                    else {
                        theX = `<div>${currentX}:${data[currentX]}</div>`
                    }
                    return theState + theX + theY
                })

    svg.call(toolTip)

    function xMinMax(){
        xMin = d3.min(data, function(d){
            return parseFloat(d[currentX]) * 0.90
        })
        xMax = d3.max(data, function(d){
            return parseFloat(d[currentX]) * 1.10
        })
    }

    function yMinMax(){
        yMin = d3.min(data, function(d){
            return parseFloat(d[currentY]) * 0.90
        })
        yMax = d3.max(data, function(d){
            return parseFloat(d[currentY]) * 1.10
        })
    }

    function labelChange(axis, clickedText){
        d3
            .selectAll(".activeText")
            .filter("."+ axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true)
        clickedText.classed("inactive", false).classed("active", true)
    }

    xMinMax();
    yMinMax();

    let xScale = d3.scaleLinear()
                    .domain([xMin, xMax])
                    .range([margin + labelArea, width - margin])

    let yScale = d3.scaleLinear()
                   .domain([yMin, yMax])
                   .range([height-margin-labelArea, margin])
    
    let xAxis = d3.axisBottom(xScale)
    let yAxis = d3.axisLeft(yScale)

    function tickCount(){
        if(width <= 500){
            xAxis.ticks(5)
            yAxis.ticks(5)
        }
        else {
            xAxis.ticks(10)
            yAxis.ticks(10)
        }
    }
    tickCount()

    svg.append("g")
        .call(xAxis)
        .attr("class","xAxis")
        .attr("transform", `translate(0, ${(height - margin -labelArea)})`)

    svg.append("g")
        .call(yAxis)
        .attr("class","yAxis")
        .attr("transform", `translate(${(margin + labelArea)}, 0)`)


    let theCircles = svg.selectAll("g theCircles").data(data).enter()

    theCircles.append("circle")
        .attr("cx", function(d){
            return xScale(d[currentX])
        })
        .attr("cy", function(d){
            return yScale(d[currentY])
        })
        .attr("r", circleRadius)
        .attr("class", function(d){
            return `stateCircle ${d.abbr}`
        })
        .on("mouseover", function(d){
            toolTip.show(d, this)
            d3.select(this).style("stroke", "#323232")
        })
        .on("mouseout", function(d){
            toolTip.hide(d)
            d3.select(this).style("stroke", "#e3e3e3")
        })

    theCircles.append("text")
            .text(function(d){
                return d.abbr
            })
            .attr("dx", function(d){
                return xScale(d[currentX])
            })
            .attr("dy", function(d){
                return yScale(d[currentY]) + circleRadius / 2.5
            })
            .attr("font-size", circleRadius)
            .attr("class", "stateText")


    d3.selectAll(".activeText").on("click", function(){
        let self = d3.select(this)
        if(self.classed("inactive")){
            let axis = self.attr("data-axis")
            let name = self.attr("data-name")

            if(axis === "x"){
                currentX = name;
                xMinMax()
                xScale.domain([xMin, xMax])
                svg.select(".xAxis").transition().duration(300).call(xAxis)
                
                
                d3.selectAll("circle").each(function(){
                    d3.select(this).transition("cx", function(d){
                        return xScale(d[currentX])
                    }).duration(300)
                })

                d3.selectAll(".stateText").each(function(){
                    d3.select(this).transition("dx", function(d){
                        return xScale(d[currentX])
                    }).duration(300)
                })

                labelChange(axis, self)

                
            } 
            else {
                currentY = name 
                yMinMax()
                yScale.domain([yMin, yMax])
                svg.select(".yAxis").transition().duration(300).call(yAxis)
                d3.selectAll("circle").each(function(){
                    d3.select(this).transition("cy", function(d){
                        return yScale(d[currentY])
                    }).duration(300)
                })

                d3.selectAll(".stateText").each(function(){
                    d3.select(this).transition("dx", function(d){
                        return yScale(d[currentY])
                    }).duration(300)
                })

                labelChange(axis, self)
            }
        }

    })
               
}

d3.csv("data.csv").then(function(data){
    visualize(data)
})