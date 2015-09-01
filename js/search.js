"use strict";

// ---------------------------------------------------------------------------
// Nós da busca (Search nodes)
// ---------------------------------------------------------------------------

// Construtor da estrutura Nó da árvore de busca
var Node = function (action, parent, state, depth, g, h) {
	this.state = state;     // representação do estado do nó
	this.parent = parent;   // nó pai na árvore de busca
	this.action = action;   // ação que gerou o nó
	this.depth = depth;     // profundidade do nó na árvore de busca
	this.g = g;             // custo de caminho até o nó
	this.h = h;             // heurística de custo até meta
};

// Recupera o caminho (sequência de ações) do nó raiz até nó corrente.
Node.prototype.getPath = function () {
	var path = [];
	var node = this;
	while (node.parent !== null) {
		path.unshift(node.action);
		node = node.parent;
	}
	return path;
};

// ==========================================================================================
// Buscas não-informadas (cegas)


// ---------------------------------------------------------------------------
// Busca em Profundidade (Depth-First Search)
// ---------------------------------------------------------------------------
var DFS = function (problem) {

	// retorno da função: mantenha essa interface!!!
	// solução e estatísticas de busca
	var result = {
		solution: null,   // solução: sequência de ações
		generated: 0,     // número de nós gerados
		expanded: 0,      // número de nós expandidos
		ramification: 0   // fator de ramificação médio
	} , stack , node , actions , next , init , visited

	// Implemente a busca em profundidade com busca em grafo
	init = new Node( null , null , problem.initialState , 0 , null , null )
	visited = new Set()
	stack = new Stack()
	stack.push( init )
	while( !stack.empty() ){
		node = stack.pop()
		result.expanded += 1
		if( problem.GoalTest( node.state ) ){
			result.solution = node.getPath()
			break
		}
		actions = problem.Actions( node.state )
		actions.forEach( function( act ){
			var state = problem.Result( node.state , act )
			var depth = node.depth + problem.StepCost( node.state , act )
			if( !visited.hasElement( state ) ){
				next = new Node( act , node , state , depth , null , null )
				result.generated += 1
				result.ramification += 1
				stack.push( next )
			}
		} )
	}
	result.ramification = result.expanded / result.generated
	return result ;
} ;


// ---------------------------------------------------------------------------
// Busca em Largura (Breadth-First Search)
// ---------------------------------------------------------------------------
var BFS = function (problem) {

	// retorno da função: mantenha essa interface!!!
	// solução e estatísticas de busca
	var result = {
		solution: null,   // solução: sequência de ações
		generated: 0,     // número de nós gerados
		expanded: 0,      // número de nós expandidos
		ramification: 0   // fator de ramificação médio
	} , queue , node , actions , next , init , visited

	// Implemente a busca em largura com busca em grafo
	init = new Node( null , null , problem.initialState , 0 , null , null )
	visited = new Set()
	queue = new Queue()
	queue.put( init )
	while( !queue.empty() ){
		node = queue.get()
		visited.add( node.state )
		result.expanded += 1
		if( problem.GoalTest( node.state ) ){
			result.solution = node.getPath()
			break
		}
		actions = problem.Actions( node.state )
		actions.forEach( function( act ){
			var state = problem.Result( node.state , act )
			if( !visited.hasElement( state ) ){
				next = new Node( act , node , state , node.depth + problem.StepCost( node.state , act ) , null , null )
				result.generated += 1
				queue.put( next )
			}
		} )
	}
	result.ramification = result.expanded / result.generated
	return result ; // retorna falha se não encontrou solução
};



// ==========================================================================================
// Buscas informadas

// Heurística da distância de manhatttan: devolve a distância de manhattan
// entre a posição do tetraminó do estado s1 e a posição do tetraminó do estado s2
var manhattanDistance = function ( s1 , s2 ){
	return Math.abs(s1.tetromino.xpos - s2.tetromino.xpos) + Math.abs(s1.tetromino.ypos - s2.tetromino.ypos);
} ;

var manhattanDistanceAdmissible = function (s1, s2) {
	// Modifique o cálculo da distância de manhattan para tornar a heurística admissível
	return Math.abs( s1.tetromino.ypos - s2.tetromino.ypos )
} ;


// ---------------------------------------------------------------------------
// Busca de melhor escolha (Best-First Search)
// ---------------------------------------------------------------------------
var BestFS = function (problem) {

	// retorno da função: mantenha essa interface!!!
	// solução e estatísticas de busca
	var result = {
		solution: null,   // solução: sequência de ações
		generated: 0,     // número de nós gerados
		expanded: 0,      // número de nós expandidos
		ramification: 0   // fator de ramificação médio
	} , init , pqueue , actions , node , next , visited

	// Implemente a busca de melhor escolha com busca em grafo
	var h = function( state ){
		return manhattanDistanceAdmissible( state , problem.goalState )
	}
	var order_func = function( node ){
		return node.h
	}
	init = new Node( null , null , problem.initialState , 0 , null , h( problem.initialState ) )
	visited = new Set()
	pqueue = new PQueue( order_func )
	pqueue.put( init )
	while( !pqueue.empty() ){
		node = pqueue.get()
		visited.add( node.state.toString() )
		result.expanded += 1
		if( problem.GoalTest( node.state ) ){
			result.solution = node.getPath()
			break
		}
		actions = problem.Actions( node.state )
		actions.forEach( function( act ){
			var state = problem.Result( node.state , act )
			var new_h = h( state )
			var depth = node.depth + problem.StepCost( node.state , act )
			if( !visited.hasElement( state.toString() ) ){
				next = new Node( act , node , state , depth , null , new_h )
				result.generated += 1
				pqueue.put( next )
			}
		} )
	}
	result.ramification = result.expanded / result.generated

	return result; // retorna falha se não encontrou solução
};


// ---------------------------------------------------------------------------
// Busca A*
// ---------------------------------------------------------------------------
var ASTAR = function (problem) {

	// retorno da função: mantenha essa interface!!!
	// solução e estatísticas de busca
	var result = {
		solution: null,   // solução: sequência de ações
		generated: 0,     // número de nós gerados
		expanded: 0,      // número de nós expandidos
		ramification: 0   // fator de ramificação médio
	} , node , pqueue , init , actions , next , visited

	// Implemente a busca A* com busca em grafo
	var g = function( node , action ){
		return node.depth + problem.StepCost( node.state , action )
	}
	var h = function( state ){
		return manhattanDistanceAdmissible( state , problem.goalState )
	}
	var order_func = function( node ){
		return node.g + node.h
	}
	init = new Node( null , null , problem.initialState , 0 , 0 , h( problem.initialState ) )
	visited = new Set()
	pqueue = new PQueue( order_func )
	pqueue.put( init )
	while( !pqueue.empty() ){
		node = pqueue.get()
		visited.add( node.state.toString() )
		result.expanded += 1
		if( problem.GoalTest( node.state ) ){
			result.solution = node.getPath()
			break
		}
		actions = problem.Actions( node.state )
		actions.forEach( function( act ){
			var state = problem.Result( node.state , act )
			var new_g = g( node , act )
			var new_h = h( state )
			var depth = new_g
			if( !visited.hasElement( state.toString() ) ){
				next = new Node( act , node , state , depth , new_g , new_h )
				result.generated += 1
				pqueue.put( next )
			}
		} )
	}
	result.ramification = result.expanded / result.generated

	return result; // retorna falha se não encontrou solução
};
