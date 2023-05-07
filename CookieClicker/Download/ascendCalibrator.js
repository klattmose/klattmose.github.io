/*
	05/08/2022: wrote a system that lets me edit heavenly upgrade positioning on the ascend screen more easily
*/

(function(){
	
	
	let l=function(what){return document.getElementById(what);}
	Dist=function(x1,y1,x2,y2)
	{
		var a=x1-x2;var b=y1-y2;
		return Math.sqrt(a*a+b*b);
	}
	Angle=function(x1,y1,x2,y2)
	{
		return Math.atan2(y2-y1,x2-x1);
	}
	
	let isOn=false;
	
	let nodes=[];
	let nodeEls=[];
	let nodesByEl={};
	let nodesById={};
	
	
	//custom interface
	let isOnCondition=()=>(Game.DebuggingPrestige && Game.OnAscend==1);
	
	let getNodes=()=>
	{
		let list=[];
		let els=l('ascendUpgrades').querySelector('.crateBox').querySelectorAll('.crate.upgrade.heavenly');
		for (var i=0;i<els.length;i++)
		{
			let el=els[i];
			let obj=Game.UpgradesById[parseInt(el.dataset.id)];
			let node={id:list.length,el:el,obj:obj,x:obj.posX,y:obj.posY,parents:[],children:[]};
			node.prevx=node.x;node.prevy=node.y;
			list.push(node);
			nodeEls.push(el);
			nodesByEl[el.id]=node;
			nodesById[node.id]=node;
		}
		
		for (var i=0;i<list.length;i++)
		{
			let me=list[i];
			me.el.onclick='';
			me.el.onmouseover='';
			for (var ii=0;ii<me.obj.parents.length;ii++)
			{
				let parent=list.find(it=>it.obj.id==me.obj.parents[ii].id);
				me.parents.push(parent);
				parent.children.push(me);
			}
		}
		
		return list;
	}
	
	let updateNode=(node)=>
	{
		let me=node.obj;
		me.posX=Math.floor(node.x);
		me.posY=Math.floor(node.y);
		node.el.style.left=Math.floor(me.posX)+'px';
		node.el.style.top=Math.floor(me.posY)+'px';
		for (var i in me.parents)
		{
			var origX=0;
			var origY=0;
			var targX=me.posX+28;
			var targY=me.posY+28;
			if (me.parents[i]!=-1) {origX=me.parents[i].posX+28;origY=me.parents[i].posY+28;}
			var rot=-(Math.atan((targY-origY)/(origX-targX))/Math.PI)*180;
			if (targX<=origX) rot+=180;
			var dist=Math.floor(Math.sqrt((targX-origX)*(targX-origX)+(targY-origY)*(targY-origY)));
			
			l('heavenlyLink'+me.id+'-'+i).style='width:'+dist+'px;transform:rotate('+rot+'deg);left:'+(origX)+'px;top:'+(origY)+'px;';
		}
	}
	
	let onMove=()=>
	{
		Game.tooltip.hide();
	}
	
	let transformMouseCoords=(x,y)=>
	{
		x=x*(1/Game.AscendZoomT);
		y=y*(1/Game.AscendZoomT);
		return [x,y];
	}
	let transformPivotCoords=(x,y)=>
	{
		let box=l('ascendZoomable').getBoundingClientRect();
		x=(x+Game.AscendOffX)*(Game.AscendZoom)+box.left;
		y=(y+Game.AscendOffY)*(Game.AscendZoom)+box.top;
		return [x,y];
	}
	let untransformPivotCoords=(x,y)=>
	{
		let box=l('ascendZoomable').getBoundingClientRect();
		x-=box.left;
		y-=box.top;
		x/=Game.AscendZoom;
		y/=Game.AscendZoom;
		x-=Game.AscendOffX;
		y-=Game.AscendOffY;
		return [x,y];
	}
	let nodeOffset=(x,y)=>
	{
		return [x+30,y+30];
	}
	let nodeUnOffset=(x,y)=>
	{
		return [x-30,y-30];
	}
	
	let exportData=(nodes)=>
	{
		var str='';
		for (var i=0;i<nodes.length;i++)
		{
			let node=nodes[i];
			let me=node.obj;
			if (me.placedByCode) continue;
			str+=me.id+':['+Math.floor(me.posX)+','+Math.floor(me.posY)+'],';
		}
		return 'Game.UpgradePositions={'+str+'};';
	}
	//end custom interface
	
	
	let toStr=()=>
	{
		var o={};
		for (var i=0;i<nodes.length;i++)
		{
			let node=nodes[i];
			o[node.id]={x:node.x,y:node.y};
		}
		return JSON.stringify(o);
	}
	let fromStr=(str)=>
	{
		var o=JSON.parse(str);
		for (var i=0;i<nodes.length;i++)
		{
			let node=nodes[i];
			if (o[node.id])
			{
				node.x=o[node.id].x;
				node.y=o[node.id].y;
				node.prevx=node.x;node.prevy=node.y;
			}
		}
		updatePositions();
	}
	
	let undoSteps=[];
	let redoSteps=[];
	let prevState=0;
	let saveStep=()=>{
		redoSteps=[];
		undoSteps.unshift([prevState,toStr()]);
		prevState=toStr();
	}
	let undo=()=>{
		if (undoSteps.length==0) return;
		let step=undoSteps[0];
		undoSteps.shift();
		redoSteps.unshift(step);
		fromStr(step[0]);
		prevState=toStr();
	}
	let redo=()=>{
		if (redoSteps.length==0) return;
		let step=redoSteps[0];
		redoSteps.shift();
		undoSteps.unshift(step);
		fromStr(step[1]);
		prevState=toStr();
	}
	
	
	let updatePositions=()=>
	{
		for (var i=0;i<nodes.length;i++)
		{
			let node=nodes[i];
			updateNode(node);
		}
		for (var i=0;i<nodes.length;i++)//do it twice to take care of connection lines etc
		{
			let node=nodes[i];
			updateNode(node);
		}
		l('calibratorExport').value=exportData(nodes);
	}
	
	let hasAddedListeners=false;
	
	let selectedNodes=[];
	
	let rootEl=0;
	let pivotEl=0;
	let pivot=0;
	let getPivot=()=>
	{
		if (Array.isArray(pivot)) return pivot;
		else if (typeof pivot==='object') return nodeOffset(pivot.prevx,pivot.prevy);
		else return [0,0];
	}
	let setup=function()
	{
		let el=document.createElement('div');
		el.id="calibrator";
		el.style.cssText='z-index:100000000000;position:absolute;left:0px;top:0px;right:0px;bottom:0px;pointer-events:none;';
		el.innerHTML=`
		<div style="position:absolute;left:4px;bottom:44px;text-align:left;color:#fff;text-shadow:0px 1px 1px #000;line-height:125%;">
			<button id="calibratorEvenFromPivotButton">Even from pivot</button><br>
			<button id="calibratorEvenFromOthersButton">Even from each other</button><br>
			Use:<br>
			-select nodes by clicking; select multiple with Shift<br>
			-move selection by dragging<br>
			-set pivot by ctrl-clicking anywhere<br>
			-move selection around pivot by right-click-dragging<br>
			-undo/redo with ctrl-z and ctrl-y<br>
			<input type="text" style="pointer-events:auto;display:inline-block;min-width:200px;max-width:100%;" id="calibratorExport"/></div>
		</div>
		<div id="calibratorPivot"></div>
		`;
		document.body.appendChild(el);
		
		if (!l('calibratorStyle'))
		{
			var css=`
				#calibrator button
				{
					pointer-events:auto;
					border:1px solid #000;
					box-shadow:1px 1px 0px #fff inset,-1px -1px 0px #999 inset;
					background:#ccc;
					color:#000;
					cursor:pointer;
					margin:0px 2px 2px 0px;
				}
				#calibrator button:hover{filter:brightness(150%);}
				#calibratorPivot
				{
					width:64px;
					height:64px;
					background:rgba(255,255,255,0.1);
					box-shadow:0px 0px 16px 4px #6cf;
					border-radius:100%;
					position:absolute;
					left:0px;top:0px;
					margin-left:-32px;
					margin-top:-32px;
					animation:calibratorPing 0.5s infinite;
				}
				@keyframes calibratorPing
				{
					from {transform:scale(1.3);}
					to {transform:scale(1);}
				}
			`;
			var style=document.createElement('style');
			style.type='text/css';
			style.appendChild(document.createTextNode(css));
			style.id="calibratorStyle";
			document.head.appendChild(style);
		}
		
		
		l('calibratorEvenFromPivotButton').addEventListener('click',()=>{
			//sets all selected nodes at equal distance and angles from the pivot
			//probably an easier way of doing this
			if (selectedNodes.length<2) return;
			let [fromX,fromY]=getPivot();
			let dist=0;
			let nodeAngles=[];
			for (var i=0;i<selectedNodes.length;i++)
			{
				let node=selectedNodes[i];
				let [prevx,prevy]=nodeOffset(node.prevx,node.prevy);
				let nodeDist=Dist(prevx,prevy,fromX,fromY);
				let nodeAngle=(-Angle(prevx,prevy,fromX,fromY)-Math.PI/2+Math.PI*2)%(Math.PI*2);
				dist+=nodeDist/selectedNodes.length;
				nodeAngles.push({node:node,angle:nodeAngle});
			}
			//find start angle
			nodeAngles.sort((a,b)=>(b.angle-a.angle));
			var startNode=0;
			var maxAngle=0;
			for (var i=0;i<nodeAngles.length;i++)
			{
				let prev=nodeAngles[i==0?(nodeAngles.length-1):(i-1)];
				let a=(nodeAngles[i].angle-prev.angle+Math.PI*2)%(Math.PI*2)-Math.PI*2;
				nodeAngles[i].angleD=a;
				if (a<maxAngle){maxAngle=a;startNode=nodeAngles[i];}
			}
			nodeAngles.sort((a,b)=>(b.angleD-a.angleD));
			let angleInc=0;
			for (var i=0;i<nodeAngles.length-1;i++)
			{angleInc+=nodeAngles[i].angleD;}
			angleInc/=nodeAngles.length-1;
			let angleMin=startNode.angle;
			nodeAngles.sort((a,b)=>(b.angle-a.angle));
			var ind=nodeAngles.indexOf(startNode);
			nodeAngles=nodeAngles.slice(ind,nodeAngles.length).concat(nodeAngles.slice(0,ind));
			for (var i=0;i<nodeAngles.length;i++)
			{
				let node=nodeAngles[i].node;
				let [prevx,prevy]=nodeOffset(node.prevx,node.prevy);
				let nodeDist=dist;
				let nodeAngle=angleMin+angleInc*i;
				let x=fromX+Math.sin(nodeAngle)*(nodeDist);
				let y=fromY+Math.cos(nodeAngle)*(nodeDist);
				[x,y]=nodeUnOffset(x,y);
				node.x=x;node.y=y;
				node.prevx=node.x;node.prevy=node.y;
			}
			updatePositions();
			saveStep();
		});
		l('calibratorEvenFromOthersButton').addEventListener('click',()=>{
			//equalizes all distances and angles between a chain of nodes
			if (selectedNodes.length<3) return;
			
			//find roots
			let roots=[];
			let chains={};
			for (var i=0;i<selectedNodes.length;i++)
			{
				let isInChain=false;
				let node=selectedNodes[i];
				for (var ii=0;ii<node.parents.length;ii++)
				{
					if (selectedNodes.indexOf(node.parents[ii])!=-1) isInChain=true;
				}
				if (!isInChain) {roots.push(node);}
			}
			//make chains
			for (var i=0;i<roots.length;i++)
			{
				let node=roots[i];
				chains[node.id]=[node];
				let addChildren=(me)=>{
					for (var ii=0;ii<me.children.length;ii++)
					{
						if (selectedNodes.indexOf(me.children[ii])!=-1) {chains[node.id].push(me.children[ii]);addChildren(me.children[ii]);break;}
					}
				};
				addChildren(node,chains[node.id]);
			}
			
			
			for (var i in chains)
			{
				if (chains[i].length<3) continue;
				
				let dist=0;
				let nodeAngles=[];
				nodeAngles.push({node:chains[i][0],angle:0,angleD:0});
				for (var ii=1;ii<chains[i].length;ii++)
				{
					let node=chains[i][ii];
					let [fromX,fromY]=nodeOffset(chains[i][ii-1].prevx,chains[i][ii-1].prevy);
					let [prevx,prevy]=nodeOffset(node.prevx,node.prevy);
					let nodeDist=Dist(prevx,prevy,fromX,fromY);
					let nodeAngle=(-Angle(prevx,prevy,fromX,fromY)-Math.PI/2+Math.PI*2)%(Math.PI*2);
					dist+=nodeDist;
					nodeAngles.push({node:node,angle:nodeAngle,angleD:0});
				}
				dist/=(chains[i].length-1);
				
				for (var ii=1;ii<nodeAngles.length;ii++)
				{
					let prev=nodeAngles[ii-1];
					let a=(nodeAngles[ii].angle-prev.angle+Math.PI*2)%(Math.PI*2);
					if (a>=Math.PI) a-=Math.PI*2;
					nodeAngles[ii].angleD=a;
				}
				var startNode=nodeAngles[1];
				let angleInc=0;
				for (var ii=2;ii<nodeAngles.length;ii++)
				{angleInc+=nodeAngles[ii].angleD;}
				angleInc/=nodeAngles.length-2;
				
				for (var ii=1;ii<nodeAngles.length;ii++)
				{
					let node=nodeAngles[ii].node;
					let [fromX,fromY]=nodeOffset(chains[i][ii-1].prevx,chains[i][ii-1].prevy);
					let [prevx,prevy]=nodeOffset(node.prevx,node.prevy);
					let nodeDist=dist;
					let nodeAngle=startNode.angle+angleInc*(ii-1);
					let x=fromX+Math.sin(nodeAngle)*(nodeDist);
					let y=fromY+Math.cos(nodeAngle)*(nodeDist);
					[x,y]=nodeUnOffset(x,y);
					node.x=x;node.y=y;
					node.prevx=node.x;node.prevy=node.y;
				}
				//todo: ideally the first and last nodes don't move
			}
			updatePositions();
			saveStep();
		});
		
		
		nodes=getNodes();
		
		prevState=toStr();
		l('calibratorExport').value=exportData(nodes);
		
		rootEl=el;
		pivotEl=l('calibratorPivot');
		
		
		let clickFromX=0,clickFromY=0,clickFromAngle=0,clickFromDist=0;
		let clickOffX=0,clickOffY=0;
		let isClicking=false;
		let isRClicking=false;
		let isDragging=false;
		let isPivoting=false;
		
		selectNode=(node)=>
		{
			node.el.style.filter='brightness(150%) drop-shadow(0px 0px 8px #6cf)';
		}
		deselectNode=(node)=>
		{
			node.el.style.filter='';
		}
		
		if (!hasAddedListeners)
		{
			document.addEventListener('contextmenu',e=>{
				if (!e.ctrlKey) e.preventDefault();
			});
			document.addEventListener('mousedown',e=>{
				if (!isOn) return;
				clickFromX=e.clientX;
				clickFromY=e.clientY;
				clickOffX=0;clickOffY=0;
				if (nodeEls.indexOf(e.target)!=-1 && nodesByEl[e.target.id])
				{
					let node=nodesByEl[e.target.id];
					if (e.button==0 && !e.ctrlKey)
					{
						//select and deselect
						
						if (e.shiftKey)
						{
							if (selectedNodes.indexOf(node)!=-1) selectedNodes.splice(selectedNodes.indexOf(node),1);
							else selectedNodes.push(node);
						}
						else
						{
							if (selectedNodes.indexOf(node)!=-1){}
							else
							{
								for (var i=0;i<selectedNodes.length;i++){deselectNode(selectedNodes[i]);}
								selectedNodes=[node];
							}
						}
						
						if (selectedNodes.indexOf(node)!=-1) selectNode(node);
						else deselectNode(node);
						
						isClicking=true;
					}
					else if (e.button==0 && e.ctrlKey)
					{
						//set pivot on node
						pivot=node;
					}
					else if (e.button==2)
					{
						isRClicking=true;
					}
					
					e.preventDefault();
					e.stopPropagation();
				}
				else
				{
					if (e.button==0 && e.ctrlKey)
					{
						//set pivot on point
						pivot=untransformPivotCoords(clickFromX,clickFromY);
					}
				}
			},true);
			document.addEventListener('mousemove',e=>{
				if (!isOn) return;
				if (!isDragging && isClicking && Dist(clickFromX,clickFromY,e.clientX,e.clientY)>=5) isDragging=true;
				if (!isPivoting && isRClicking && Dist(clickFromX,clickFromY,e.clientX,e.clientY)>=5)
				{
					//pivot
					isPivoting=true;
					let [fromX,fromY]=getPivot();
					let [toX,toY]=untransformPivotCoords(clickFromX,clickFromY);
					clickFromAngle=-Angle(fromX,fromY,toX,toY)+Math.PI/2;
					clickFromDist=Dist(fromX,fromY,toX,toY);
				}
				if (isDragging && selectedNodes.length>0)
				{
					[clickOffX,clickOffY]=transformMouseCoords(e.clientX-clickFromX,e.clientY-clickFromY);
					for (var i=0;i<selectedNodes.length;i++)
					{
						let node=selectedNodes[i];
						node.x=node.prevx+clickOffX;
						node.y=node.prevy+clickOffY;
					}
					updatePositions();
				}
				else if (isPivoting && selectedNodes.length>0)
				{
					[clickOffX,clickOffY]=transformMouseCoords(e.clientX-clickFromX,e.clientY-clickFromY);
					let [fromX,fromY]=getPivot();
					let [toX,toY]=untransformPivotCoords(e.clientX,e.clientY);
					let angle=clickFromAngle-(-Angle(fromX,fromY,toX,toY)+Math.PI/2);
					let dist=Dist(fromX,fromY,toX,toY)/clickFromDist;
					for (var i=0;i<selectedNodes.length;i++)
					{
						let node=selectedNodes[i];
						let [prevx,prevy]=nodeOffset(node.prevx,node.prevy);
						let nodeDist=Dist(prevx,prevy,fromX,fromY);
						let nodeAngle=-Angle(prevx,prevy,fromX,fromY)-Math.PI/2;
						let x=fromX+Math.sin(nodeAngle-angle)*(nodeDist*dist);
						let y=fromY+Math.cos(nodeAngle-angle)*(nodeDist*dist);
						[x,y]=nodeUnOffset(x,y);
						node.x=x;node.y=y;
					}
					updatePositions();
				}
				onMove();
			});
			document.addEventListener('mouseup',e=>{
				if (!isOn) return;
				if (selectedNodes.length>0)
				{
					for (var i=0;i<selectedNodes.length;i++)
					{
						let node=selectedNodes[i];
						node.prevx=node.x;node.prevy=node.y;
					}
					e.preventDefault();
					e.stopPropagation();
				}
				//for (var i=0;i<selectedNodes.length;i++){deselectNode(selectedNodes[i]);}
				//selectedNodes=[];
				
				if (isDragging || isPivoting) saveStep();
				isClicking=false;
				isRClicking=false;
				isDragging=false;
				isPivoting=false;
			});
			document.addEventListener('click',e=>{
				if (!isOn) return;
				if (selectedNodes.length>0)
				{
					e.preventDefault();
					e.stopPropagation();
				}
			});
			document.addEventListener('keydown',e=>{
				if (!isOn) return;
				if (e.ctrlKey && e.key=='z') undo();
				else if (e.ctrlKey && e.key=='y') redo();
			});
			hasAddedListeners=true;
		}
	}
	
	let reset=function()
	{
		if (rootEl) {rootEl.remove();rootEl=0;}
		
		nodes=[];
		nodeEls=[];
		nodesByEl={};
	}
	
	let loop=function()
	{
		let oldIsOn=isOn;
		isOn=isOnCondition();
		if (oldIsOn!=isOn)
		{
			if (isOn) setup();
			else reset();
		}
		setTimeout(loop,1000);
	}
	let draw=function()
	{
		let [x,y]=transformPivotCoords(...getPivot());
		pivotEl.style.left=x+'px';
		pivotEl.style.top=y+'px';
		setTimeout(draw,1000/30);
	}
	
	reset();
	loop();
	draw();

})();
