# buat gambar lingkaran diflutter 

```dart
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:toast/toast.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return MaterialApp(
      title: "apa kabarnyua",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.red,
        fontFamily: 'Liu'
      ),
      home: Scaffold(
        body: Align(
          alignment: Alignment.topLeft,
          child: SafeArea(
            child: Contoh(),
          ),
        ),
      ),
    );
  }
}

class Contoh extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(8),
      child: _buildStack(),
    );
  }
}


Widget _buildStack() => Stack(
  alignment: Alignment.center,
  children: <Widget>[
    CircleAvatar(
      backgroundImage: AssetImage("assets/png_splash.png"),
      radius: 100,
    ),
    Container(
      decoration: BoxDecoration(
        color: Colors.black26
      ),
      child: Text("Nama ku ",style: TextStyle(fontSize: 20,fontWeight: FontWeight.bold,color: Colors.white),),
    )
  ],
);


Widget _buildGrid() => GridView.extent(
    maxCrossAxisExtent: 150,
    padding: const EdgeInsets.all(8),
    mainAxisSpacing: 4,
    crossAxisSpacing: 4,
    children: _buildGridContainer(30),
);


List<Container> _buildGridContainer(int count) => List.generate(count, (i)=>Container(color: Colors.blue,child: Text(i.toString()),));

```
