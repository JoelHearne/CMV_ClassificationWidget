define([
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'dojo/dom-construct',
	"dojo/dom", "dojo/request", "dojo/json",
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/on',
	'dojo/keys',
	'dojo/store/Memory',
	'dgrid/OnDemandGrid',
	'dgrid/Selection',
	'dgrid/Keyboard',
	'esri/layers/GraphicsLayer',
	'esri/layers/ArcGISDynamicMapServiceLayer',
	"esri/layers/DynamicLayerInfo", "esri/layers/QueryDataSource", "esri/layers/LayerDataSource","esri/layers/LayerMapSource","esri/renderers/UniqueValueRenderer","esri/layers/ImageParameters",
	"esri/layers/LayerDrawingOptions",
	"esri/layers/TableDataSource",
	'esri/graphic',
	'esri/renderers/SimpleRenderer',
	'esri/symbols/SimpleMarkerSymbol',
	'esri/symbols/SimpleLineSymbol',
	'esri/symbols/SimpleFillSymbol',
	'esri/graphicsUtils',
	'esri/tasks/FindTask',
	'esri/tasks/FindParameters',
	'esri/geometry/Extent',
	'dojo/text!./ClassBreaks/templates/ClassBreaks.html',
	"dijit/Dialog",
	'dijit/form/Form',
	"dijit/form/TextBox",
	"dijit/form/Button",
	"dojo/_base/Color",
	'dojo/io-query',
	'dijit/form/FilteringSelect',
	'dijit/form/ValidationTextBox',
	'dijit/form/CheckBox',
    "dojo/ready", "dojo/parser", "dijit/registry", "dojo/on",
	'xstyle/css!./ClassBreaks/css/ClassBreaks.css',
	"dojo/domReady!"
	//,'dojo/request'
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, domConstruct,dom, request, JSON, lang, array, on, keys, Memory, OnDemandGrid, Selection, Keyboard, GraphicsLayer,ArcGISDynamicMapServiceLayer,DynamicLayerInfo, QueryDataSource, LayerDataSource,LayerMapSource,UniqueValueRenderer, ImageParameters, LayerDrawingOptions, TableDataSource,Graphic, SimpleRenderer, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, graphicsUtils, FindTask, FindParameters, Extent, ClassBreaksTemplate,Dialog, Form, TextBox, Button,Color,ioQuery) {

	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		widgetsInTemplate: true,
		templateString: ClassBreaksTemplate,
		baseClass: 'gis_ClassBreaksSearchDijit',

		// Spatial Reference. uses the map's spatial reference if none provided
		spatialReference: null,



		postCreate: function () {
			this.inherited(arguments);

			if (this.spatialReference === null) {
				this.spatialReference = this.map.spatialReference.wkid;
			}

			this.createClassLayer();

		},

		createClassLayer: function () {
                /*
			    var imageParameters = new ImageParameters();
				var layerDefinitions = [];
				layerDefinitions[0] = "\"PERMIT_TYPE_CODE\" ='gbp'";

               //imageParameters.layerDefinitions = layerDefinitions;


			   imageParameters.layerIds = [102];
			   imageParameters.layerOption = ImageParameters.LAYER_OPTION_INCLUDE;
			   imageParameters.transparent = true;
			   imageParameters.imageSpatialReference=this.map.spatialReference;
               */

                var gmURL="http://gisvm101:6080/arcgis/rest/services/GM/GM_PermitsD/MapServer";
                /*
                var gmLayerOptions= {
					    "id": "102",
						"opacity": 1.0
						//,"showAttribution": false
						 ,	"imageParameters": imageParameters
						 //,useMapImage: true

                };
                */

                var dynamicLayerInfos = [];

				/*
				  var dynamicLayerInfo = new DynamicLayerInfo();
				  dynamicLayerInfo.id = 102;



				  var dataSource = new QueryDataSource();
				  dataSource.workspaceId = "SDE_WS";
				  dataSource.query = "SELECT * FROM SDE.DBO.EDEN_PERMIT_VW WHERE PERMIT_TYPE_CODE ='gbp'";

				  var layerSource = new LayerDataSource();
				  layerSource.dataSource = dataSource;
				  dynamicLayerInfo.source = layerSource;
				  //dynamicLayerInfo.source = new LayerDataSource({
				  //    "type":"mapLayer",
				  //    "mapLayerId":0
				  //});

				 */


				 var dynamicLayerInfo = new DynamicLayerInfo( {  "id":102,
					  //"definitionExpression":"PERMIT_TYPE_CODE ='gbp'",
					   "source":{
						   "type":"mapLayer",
						   "mapLayerId":0
						}
					   /*,"drawingInfo":
							{
							  "renderer":
							  {
								"type": "simple",
								"symbol":
								{
								  "type" : "esriSFS",
								  "style" : "esriSFSSolid",
								  "color" : [205,0,0,255],
								  "outline" :
								  {
									"type" : "esriSLS",
									"style" : "esriSLSSolid",
									"color" : [255,0,0,255],
									"width" : 4.0
								  }
								},
								"label": "Roofing",
								"description": ""
							  }
						 }*/
				  });



                  dynamicLayerInfos.push(dynamicLayerInfo);
                  //var gmdLayer = new ArcGISDynamicMapServiceLayer(gmURL, gmLayerOptions);
				  var gmdLayer = new ArcGISDynamicMapServiceLayer(gmURL);

				  /*gmdLayer.setInfoTemplates({
					1: { infoTemplate: _blockGroupInfoTemplate },
					2: { infoTemplate: _countyCensusInfoTemplate }
				  });*/

				  //gmdLayer.setLayerDefinitions(layerDefinitions);
                  gmdLayer.setDynamicLayerInfos(dynamicLayerInfos);

				   //var defaultSymbol = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_NULL);
				   //defaultSymbol.outline.setStyle(SimpleLineSymbol.STYLE_NULL);

				   var defaultSymbol = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_SOLID);
				   defaultSymbol.setColor(new Color([255, 0, 0, 1.0]));
				   defaultSymbol.setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([25,25,25]), 1));

				   //create renderer
				   var renderer = new UniqueValueRenderer(defaultSymbol, "PERMIT_TYPE_CODE");
				   //var renderer = new SimpleRenderer(defaultSymbol);

				   //add symbol for each possible value
				   renderer.addValue("gbp", new SimpleFillSymbol().setColor(new Color([205, 0, 0, 1.0])));
				   renderer.addValue("asp", new SimpleFillSymbol().setColor(new Color([0, 123, 0, 1.0])));
                   renderer.addValue("mec", new SimpleFillSymbol().setColor(new Color([25, 0, 98, 1.0])));
				   renderer.addValue("fal", new SimpleFillSymbol().setColor(new Color([55, 90, 0, 1.0])));
                   renderer.addValue("dev", new SimpleFillSymbol().setColor(new Color([0, 255, 0, 1.0])));
                   renderer.addValue("elecom", new SimpleFillSymbol().setColor(new Color([0, 0, 255, 1.0])));

					var optionsArray = [];
					var drawingOptions = new esri.layers.LayerDrawingOptions();

					drawingOptions.renderer = renderer;

					optionsArray[102] =drawingOptions; // works! array index is the id of the dynamic layer
				    gmdLayer.setLayerDrawingOptions(optionsArray);

                    //map.getLayer("layer1").setLayerDefinitions(["STATE_NAME='Kansas' and POP2007>250000"]);

				    //gmdLayer.setVisibleLayers([102]);


					  gmdLayer.on('load', function (e) {
							 //console.log("loaded");
							 //console.log(e);
					   });

					  gmdLayer.on('map-image-export', function (e) {
							 //console.log("map-image-export");
							 //console.log(e);
					   });
					  gmdLayer.on('update', function (e) {
							 //console.log("update");
							 //console.log(e);
					   });
					   gmdLayer.on('update-end', function (e) {
							 //console.log("update-end");
							 //console.log(e);
					   });
					   gmdLayer.on('update-start', function (e) {
							 //console.log("update-start");
							 //console.log(e);
					   });
					   gmdLayer.on('error', function (e) {
							 console.log("error");
							 console.log(e);
					   });


						// overriding the image url works!!!
						/*
						gmdLayer.getImageUrl= function (extent, width, height, callback) {
											console.log("ggggggotit");
											//console.log(this );

											//this._params.dynamicLayers='[{"id":102,"definitionExpression":"\\"PERMIT_TYPE_CODE\\" like \'gbp%\'","source":{"type":"mapLayer","mapLayerId":0} ,"drawingInfo":{"renderer":{ "type": "simple","symbol":{"type" : "esriSFS", "style" : "esriSFSSolid", "color" : [205,0,0,255], "outline" :{ "type" : "esriSLS","style" : "esriSLSSolid","color" : [255,0,0,255], "width" : 4.0}},"label": "Roofing","description": ""},"transparency": 60 }}]';

											var params = {
											  dpi:96,
											  transparent:true,
											  format:"png",
											  bbox:this._map.extent.xmin + "," + this._map.extent.ymin + "," + this._map.extent.xmax + "," + this._map.extent.ymax,
											  bboxSR:this._map.spatialReference.wkid,
											  imageSR:this._map.spatialReference.wkid,
											  size:this._map.width+","+this._map.height,
											  dynamicLayers:'[{"id":102,"definitionExpression":"\\"PERMIT_TYPE_CODE\\" like \'gbp%\'","source":{"type":"mapLayer","mapLayerId":0} ,"drawingInfo":{"renderer":{ "type": "simple","symbol":{"type" : "esriSFS", "style" : "esriSFSSolid", "color" : [205,0,0,255], "outline" :{ "type" : "esriSLS","style" : "esriSLSSolid","color" : [255,0,0,255], "width" : 4.0}},"label": "Roofing","description": ""},"transparency": 60 }}]',
											  f:"image"
											};

											//console.log(this._url.path + "/export?" + ioQuery.objectToQuery(params));
											var durl=this._url.path + "/export?" + ioQuery.objectToQuery(params);

										  // console.log(this);

										   // var result =  getImageUrl.call(gmdLayer, extent, width, height, function (url) {
										   //      callback.call(gmdLayer, url);
										   // });

											callback(durl);

											 //return result;
											 return durl;

										};
						*/



                        this.map.addLayer(gmdLayer);

		}
	});
});