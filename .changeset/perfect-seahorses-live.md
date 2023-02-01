---
'@graphql-codegen/flutter-freezed': patch
---

missing trailing comma in enums
Before
```dart
enum AssetOrder {
  @JsonKey(name: 'contentType_ASC')
  contentTypeAsc
  @JsonKey(name: 'contentType_DESC')
  contentTypeDesc
}
```
Now
```dart
enum AssetOrder {
  @JsonKey(name: 'contentType_ASC')
  contentTypeAsc,
  @JsonKey(name: 'contentType_DESC')
  contentTypeDesc,
}
```
