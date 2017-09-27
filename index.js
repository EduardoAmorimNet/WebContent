$(document).ready(function(){
	var app = new Application();
	var dataElement = {"element":"title","location":"form","properties":["label"], "show":["panel"]};
	
	allBinds(app);
	
	app.modal('show', dataElement);
	app.showLi(dataElement.show);	
});

function allBinds(app, creator){
	$('#btConfirm').on('click', function(){
		app.saveProperties();
	});
	
	$('.list-group-item').on('click', function(){
		if(this.id == 'liHelp') showDiv(true, 'div-help');
		else if(this.id == 'liDoc'){
			showDiv(true, 'div-documentation');
			new Documentation();
		}
		else{
			var dataElement = $(this).data('element');
			if(dataElement.element != '') app.modal('show', dataElement);
			app.showLi(dataElement.show);
		}
	});
	
	$('#codigoFonte').on('blur', function(){
		app.loadForm();	
		app.refreshLi();
	})
	
	$('#btCloseHelp').on('click', function(){
		showDiv(false, 'div-help');
	});
	
	$('#btCloseDoc').on('click', function(){
		showDiv(false, 'div-documentation');
	});
	
	var showDiv = function(show, divId){
		if(show == true){
			$('#divApp').hide();
			$('#'+divId).show();
		}
		else{
			$('#'+divId).hide();
			$('#divApp').show();			
		}
	}
}
			
function Application(){
	var form = new FormCreator();
	var data;
	
	this.saveProperties = function(){
		this.modal('hide');
		form.addElement(data);
	}
	
	this.modal = function(action, dataElement){
		if(action == 'show'){
			var fields = dataElement.properties;
			data = dataElement;
			
			$('.div-properties input').parent().parent().hide();
			$('.div-properties input').val('');
			
			$(fields).each(function(i){
				$('#'+fields[i]).parent().parent().show();
			});
				
			$('#divApp').hide();
			$('.div-properties').show();
		}
		else{
			$('.div-properties').hide();
			$('#divApp').show();			
		}
	}
	
	this.showLi = function(lis){
		lis.push("show");
		$('li').addClass('li-hide');
		$(lis).each(function(i){
			$('.li-'+lis[i]).removeClass('li-hide');
		});		
	}
	
	this.loadForm = function(){
		form.load();
	}
	
	this.refreshLi = function(){
		if($('form .panel').length < 2) this.showLi(["panel"]);
		else if($('form .panel .row').length == 0) this.showLi(["input","group"]);
		else this.showLi(["panel","input","group"]);
	}
}		


function FormCreator(){
	var template = new Template();
	var panelId;
	var groupId;
	var appendBeforeElement = null;
	
	this.addElement = function(dataElement){
		var tmpl;
		var fields = dataElement.properties;
		var id = generateId(dataElement.element, $('#label').val());
		
		if(dataElement.element == 'panel') panelId = id;
		else if(dataElement.element.indexOf('group') >= 0) groupId = id;
		else if(dataElement.element == 'child'){
			addChild(id);
			getSource();
			return;
		}		
		
		tmpl = template.getTemplate(dataElement.element);
		tmpl = template.setParam(tmpl, 'id', id);
		$(fields).each(function(i){
			tmpl = template.setParam(tmpl, fields[i], $('#'+fields[i]).val());
		});		
		
		execAppend(dataElement.location, tmpl);
		
		if(dataElement.element == 'groupPaiFilho') alert('A tabela foi criada!');
		
		getSource();
		editLabelAndSize();
		removeField();
		appendBefore();
	}
	
	this.load = function(){
		$('form[name="form"]')[0].innerHTML = '';
		$('form[name="form"]').append($('#codigoFonte').val());
		panelId = $('form .panel').last().attr('id');
		editLabelAndSize();
		removeField();
		appendBefore();
	}
	
	var execAppend = function(location, tmpl){
		if(location == 'form') $('form[name="form"]').append(tmpl);			
		else if(location == 'group') $('#'+groupId).append(tmpl);
		else{
			if($('#'+panelId+' .row').last().length == 0) addRow();
			else if(getTotalColumns() > 12) addRow();
			
			if(appendBeforeElement == null) $('#'+panelId+' .row').last().append(tmpl);
			else{
				appendBeforeElement.css('background','#FFFFFF');
				appendBeforeElement.before(tmpl);
				appendBeforeElement = null;
			}
		}
	}
	
	var getTotalColumns = function(){
		var totalColumns = $('#size').val();
		
		$('#'+panelId+' .row').last().find('div[class*="col-md-"]').each(function(){
			totalColumns = (totalColumns*1) + (this.className.split('-')[2]*1);
		});
		
		return totalColumns;
	}
	
	var addRow = function(){
		var tmpl = template.getTemplate('row');		
		if($('#'+panelId+' .row').length > 0) $('#'+panelId+' .row').last().after(tmpl);
		else $('#'+panelId+' .panel-body').append(tmpl);
	}
	
	var addChild = function(id){
		var tmpl = template.getTemplate('labelChild');
		tmpl = template.setParam(tmpl, 'label', $('#label').val());
		$('#'+groupId+' thead tr').last().append(tmpl);
		
		tmpl = template.getTemplate('inputChild');
		tmpl = template.setParam(tmpl, 'id', id);
		$('#'+groupId+' tbody tr').last().append(tmpl);
	}
	
	var generateId = function(prefix, id){
		return prefix+'_'+id.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
	}
	
	var getSource = function(){
		var source = $('form[name="form"]')[0].innerHTML.replace(/type="text">/g,'type="text"/>');		
		$('#codigoFonte').val(source);
	}
	
	var editLabelAndSize = function(){
		$('label,h1,h3 b').off();
		$('label,h1,h3 b').dblclick(function(){
			this.innerHTML = prompt('Mudar o label para:', this.innerHTML);
			getSource();
		});
		$('label').dblclick(function(){
			var div = $(this).parent().closest('div[class*="col-md-"]');
			div[0].className = prompt('Alterar o tamanho para:',div.attr('class'));
			getSource();
		});
	}
	
	var removeField = function(){
		$('form input, form select, form textarea').off();
		$('form input, form select, form textarea').dblclick(function(){
			if(confirm('Tem certeza que deseja apagar este campo?') == true){			
				if(appendBeforeElement != null) appendBeforeElement.css('background','#FFFFFF');
				$(this).parent().closest('div[class*="col-md-"]').remove();
				getSource();
			}
		});
	}	
	
	var appendBefore = function(){
		$('form input, form select, form textarea').on('focus', function(){
			if(appendBeforeElement != null) appendBeforeElement.css('background','#FFFFFF');
			appendBeforeElement = $(this).parent().closest('div[class*="col-md-"]');			
			appendBeforeElement.css('background','#CCCCFF');
		});
		$('form h3').on('click', function(){
			if(appendBeforeElement != null) appendBeforeElement.css('background','#FFFFFF');
			appendBeforeElement = null;			
		});
	}
}

function Template(){
	this.getTemplate = function(templateName){
		var tmpl = '';
		
		switch(templateName){
			case 'title':
				tmpl+= '<div class="panel panel-default" id="{id}">';
				tmpl+= '<div class="panel-body">';
				tmpl+= '<h1>{label}</h1>';
				tmpl+= '</div>';
				tmpl+= '</div>';
				break;
			case 'panel':
				tmpl+= '<div class="panel panel-default" id="{id}">';
				tmpl+= '	<div class="panel-heading ">';
				tmpl+= '		<h3 class="panel-title"><b>{label}</b></h3>';
				tmpl+= '	</div>';
				tmpl+= '	<div class="panel-body"></div>';
				tmpl+= '</div>';
				break;			
			case 'row':
				tmpl+= '<div class="form-group row"></div>';
				break;
			case 'text':
				tmpl+= '<div class="col-md-{size}">';
				tmpl+= '	<label for="{id}">{label}</label>';
				tmpl+= '	<input type="text" class="form-control" name="{id}" id="{id}" />';
				tmpl+= '</div>';
				break;
			case 'date':
				tmpl+='<div class="col-md-{size}">';
				tmpl+='		<label for="{id}">{label}</label>';
				tmpl+='		<div class="input-group enable-calendar" data-calendar="">';
				tmpl+='			<input type="text" class="form-control" name="{id}" id="{id}" placeholder="00/00/0000" mask="00/00/0000"/>';
				tmpl+='			<span class="input-group-addon fs-cursor-pointer">';
				tmpl+='				<span class="fluigicon fluigicon-calendar"></span>';
				tmpl+='			</span>';
				tmpl+='		</div>';
				tmpl+='</div>';
				break;
			case 'money':
				tmpl+= '<div class="col-md-{size}">';
				tmpl+= '	<label for="{id}">{label}</label>';
				tmpl+= '	<input type="text" class="form-control" name="{id}" mask="#00.000.000.000.000,00" />';
				tmpl+= '</div>';
				break;
			case 'percent':
				tmpl+= '<div class="col-md-{size}">';
				tmpl+= '	<label for="{id}">{label}</label>';
				tmpl+= '	<input type="text" class="form-control" name="{id}" mask="#000,00" />';
				tmpl+= '</div>';
				break;
			case 'zoom':
				tmpl+= '<div class="col-md-{size}">';
				tmpl+= '	<label for="{id}">{label}</label>';
				tmpl+= '	<div class="input-group">';
				tmpl+= '		<input type="text" class="form-control" name="{id}" id="{id}" />';
				tmpl+= '		<span class="input-group-addon fs-cursor-pointer">';
				tmpl+= '			<span class="fluigicon fluigicon-search enable-zoom" data-zoom="[,[,],,[,],]"></span>';
				tmpl+= '		</span>';
             	tmpl+= '	</div>';
				tmpl+= '</div>';
				break;
			case 'select':
				tmpl+= '<div class="col-md-{size}">';
				tmpl+= '	<label for="{id}">{label}</label>';
				tmpl+= '	<select class="form-control" name="{id}"></select>';
				tmpl+= '</div>';
				break;
			case 'groupRadio':
				tmpl+='<div class="col-md-{size}" id="{id}">';
				tmpl+='		<label>{label}</label>';
				tmpl+='</div>';
				break;
			case 'radio':
				tmpl+='<div class="radio">';
				tmpl+='		<label>';
				tmpl+='			<input name="{id}" value="{id}" type="radio"/>';
				tmpl+='			{label}';
				tmpl+='		</label>';
				tmpl+='</div>';
				break;
			case 'groupCheckbox':
				tmpl+='<div class="col-md-{size}" id="{id}">';
				tmpl+='		<label>{label}</label>';
				tmpl+='</div>';
				break;
			case 'checkbox':
				tmpl+='<div class="checkbox">';
				tmpl+='		<label>';
				tmpl+='			<input name="{id}" value="{id}" type="checkbox"/>';
				tmpl+='			{label}';
				tmpl+='		</label>';
				tmpl+='</div>';
				break;
			case 'textarea':
				tmpl+= '<div class="col-md-{size}">';
				tmpl+= '	<label for="{id}">{label}</label>';
				tmpl+= '	<textarea class="form-control" name="{id}" id="{id}"></textarea>';
				tmpl+= '</div>';
				break;
			case 'groupPaiFilho':
				tmpl+='<div class="col-md-{size}">';
				tmpl+='		<div class="table-responsive">';
				tmpl+='			<table border="0" class="table table-striped table-bordered" tablename="{id}" id="{id}">';
				tmpl+='				<thead>';
				tmpl+='					<tr></tr>';
				tmpl+='				</thead>';
				tmpl+='				<tbody>';
				tmpl+='					<tr></tr>';
				tmpl+='				</tbody>';
				tmpl+='			</table>';
				tmpl+='		</div>';
				tmpl+='</div>';
				break;
			case 'inputChild':
				tmpl+='<td><input type="text" class="form-control" name="{id}" id="{id}" /></td>';
				break;
			case 'labelChild':
				tmpl+='<td><b>{label}</b></td>';
				break;			
		}
		
		return tmpl;
	}
	
	this.setParam = function(template, paramName, paramValue){
		var regex = new RegExp('{'+paramName+'}','g');
		return template.replace(regex, paramValue);
	}
}

function Documentation(){
	var setTitle = function(){
		$('#docTitle').text('MIF 998 - '+$('form h1').text());
	}
	
	var setFieldDetail = function(){
		var view = [];
		view['panel'] = loadPanels();
		var template = $('#tplFieldDetail')[0].innerHTML;
		var output = Mustache.render(template, view);
		$('#tableFieldDetail')[0].innerHTML = output;
	}
	
	var setFieldRules = function(){
		var view = [];
		view['panel'] = loadPanels();
		var template = $('#tplFieldRules')[0].innerHTML;
		var output = Mustache.render(template, view);
		$('#tableFieldRules')[0].innerHTML = output;
	}
	
	var setFieldControl  = function(){
		var view = [];
		view['panel'] = loadPanels();
		var template = $('#tplFieldControl')[0].innerHTML;
		var output = Mustache.render(template, view);
		$('#tableFieldControl')[0].innerHTML = output;
	}
	
	var loadPanels = function(){
		var panels = [];
		
		$('form .panel-title b').each(function(){
			var panel = {panelLabel:'',field:[]};
			var id = $(this).parent().closest('div[class*="panel-default"]')[0].id;
			panel.panelLabel = this.innerHTML;
			panel.field = loadFields(id);
			panels.push(panel);
		});
		
		return panels;
	}
	
	var loadFields = function(panelId){
		var fields = [];
		
		$('#'+panelId+' input, #'+panelId+' select, #'+panelId+' textarea').each(function(){
			var labelText = $(this).parent().closest('div[class*="col-md-"]').find('label')[0].innerHTML;
			var typeText = getType(this);
			fields.push({id: this.name, label: labelText, type: typeText, format: getFormat(typeText)});
		});
		
		return fields;
	}
	
	var getType = function(element){
		return element.name.split('_')[0];
	}
	
	var getFormat = function(type){
		switch(type){
			case 'date':
				return 'dd/mm/yyyy';
			case 'money':
				return 'X(12,2)';
			case 'percent':
				return 'X(3,2)';
			default:
				return 'X(250)';
		}
	}
	
	var printScreen = function(){
		$('#printScreen')[0].innerHTML = $('form')[0].innerHTML;	
	}
	
	setTitle();
	setFieldDetail();
	setFieldRules();
	setFieldControl();
	printScreen();
}