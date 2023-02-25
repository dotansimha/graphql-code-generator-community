import { Config } from '../src/config/config-value.js';
import { FieldName, FieldNamePattern, TypeName, TypeNamePattern } from '../src/config/pattern.js';
import { plugin } from '../src/index.js';
import {
  cyclicSchema,
  enumSchema,
  escapedSchema,
  mergeSchema,
  nonNullableListWithCustomScalars,
  simpleSchema,
  unionSchema,
} from './schema.js';

const Droid = TypeName.fromString('Droid');
// const Starship = TypeName.fromString('Starship');
const Human = TypeName.fromString('Human');
const Movie = TypeName.fromString('Movie');
const Actor = TypeName.fromString('Actor');
const SearchResult = TypeName.fromString('SearchResult');
const SearchResultDroid = TypeName.fromUnionOfTypeNames(SearchResult, Droid);

const id = FieldName.fromString('id');
const name = FieldName.fromString('name');
const friends = FieldName.fromString('friends');
const appearsIn = FieldName.fromString('appearsIn');
// const title = FieldName.fromString('title');
// const episode = FieldName.fromString('episode');
// const length = FieldName.fromString('length');

describe('The Flutter Freezed plugin produces Freezed models using a GraphQL Schema:', () => {
  describe('Enum Block: will generate a valid Enum block', () => {
    it('using the default plugin configuration: Enum values are camelCased and values that are keywords are escaped by suffixing the value with an `_`', () => {
      const output = plugin(enumSchema, [], Config.create());
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        enum Episode {
          @JsonKey(name: 'NEWHOPE')
          newhope,
          @JsonKey(name: 'EMPIRE')
          empire,
          @JsonKey(name: 'JEDI')
          jedi,
          @JsonKey(name: 'VOID')
          void_,
          @JsonKey(name: 'void')
          void_,
          @JsonKey(name: 'IN')
          in_,
          @JsonKey(name: 'in')
          in_,
          @JsonKey(name: 'String')
          string,
          @JsonKey(name: 'ELSE')
          else_,
          @JsonKey(name: 'else')
          else_,
          @JsonKey(name: 'SWITCH')
          switch_,
          @JsonKey(name: 'switch')
          switch_,
          @JsonKey(name: 'FACTORY')
          factory_,
          @JsonKey(name: 'factory')
          factory_,
        }"
      `);
    });

    it('when config.camelCasedEnums === undefined: original casing is preserved, keywords are escaped', () => {
      expect(plugin(enumSchema, [], Config.create({ camelCasedEnums: undefined })))
        .toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        enum Episode {
          NEWHOPE,
          EMPIRE,
          JEDI,
          VOID,
          @JsonKey(name: 'void')
          void_,
          IN,
          @JsonKey(name: 'in')
          in_,
          @JsonKey(name: 'String')
          String_,
          ELSE,
          @JsonKey(name: 'else')
          else_,
          SWITCH,
          @JsonKey(name: 'switch')
          switch_,
          FACTORY,
          @JsonKey(name: 'factory')
          factory_,
        }"
      `);
    });

    it('when config.camelCasedEnums === DartIdentifierCasing: Enum values are cased as configured, keywords are escaped', () => {
      const output = plugin(enumSchema, [], Config.create({ camelCasedEnums: 'PascalCase' }));
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        enum Episode {
          @JsonKey(name: 'NEWHOPE')
          Newhope,
          @JsonKey(name: 'EMPIRE')
          Empire,
          @JsonKey(name: 'JEDI')
          Jedi,
          @JsonKey(name: 'VOID')
          Void,
          @JsonKey(name: 'void')
          Void,
          @JsonKey(name: 'IN')
          In,
          @JsonKey(name: 'in')
          In,
          @JsonKey(name: 'String')
          String_,
          @JsonKey(name: 'ELSE')
          Else,
          @JsonKey(name: 'else')
          Else,
          @JsonKey(name: 'SWITCH')
          Switch,
          @JsonKey(name: 'switch')
          Switch,
          @JsonKey(name: 'FACTORY')
          Factory,
          @JsonKey(name: 'factory')
          Factory,
        }"
      `);
    });
  });

  describe('applying config:', () => {
    it('@freezed: using the default plugin configuration: generates the expected output', () => {
      const output = plugin(simpleSchema, [], Config.create());
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @freezed
        class Person with _$Person {
          const Person._();

          const factory Person({
            String? id,
            required String name,
          }) = _Person;

          factory Person.fromJson(Map<String, dynamic> json) => _$PersonFromJson(json);
        }"
      `);
    });

    it('@Freezed: generates the expected output', () => {
      const output = plugin(
        simpleSchema,
        [],
        Config.create({
          copyWith: false,
          equal: true,
          makeCollectionsUnmodifiable: true,
        }),
      );
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @Freezed(
          copyWith: false,
          equal: true,
          makeCollectionsUnmodifiable: true,
        )
        class Person with _$Person {
          const Person._();

          const factory Person({
            String? id,
            required String name,
          }) = _Person;

          factory Person.fromJson(Map<String, dynamic> json) => _$PersonFromJson(json);
        }"
      `);
    });

    it('unfreeze: generates the expected output', () => {
      const output = plugin(
        simpleSchema,
        [],
        Config.create({
          immutable: false,
        }),
      );
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @unfreezed
        class Person with _$Person {
          const Person._();

          factory Person({
            String? id,
            required String name,
          }) = _Person;

          factory Person.fromJson(Map<String, dynamic> json) => _$PersonFromJson(json);
        }"
      `);
    });

    it('@Freezed has precedence over @unfreezed over @freezed: generates the expected output', () => {
      const output = plugin(
        simpleSchema,
        [],
        Config.create({
          immutable: false,
          copyWith: false,
        }),
      );
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @Freezed(
          copyWith: false,
        )
        class Person with _$Person {
          const Person._();

          factory Person({
            String? id,
            required String name,
          }) = _Person;

          factory Person.fromJson(Map<String, dynamic> json) => _$PersonFromJson(json);
        }"
      `);
    });

    it('using mergedTypes: generates the expected output', () => {
      const output = plugin(
        mergeSchema,
        [],
        Config.create({
          mergeTypes: {
            [Movie.value]: [
              TypeName.fromString('CreateMovieInput'),
              TypeName.fromString('UpdateMovieInput'),
              TypeName.fromString('UpsertMovieInput'),
            ],
          },
        }),
      );
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @freezed
        class Movie with _$Movie {
          const Movie._();

          const factory Movie({
            required String id,
            required String title,
          }) = _Movie;

          const factory Movie.createMovieInput({
            required String title,
          }) = CreateMovieInput;

          const factory Movie.updateMovieInput({
            required String id,
            String? title,
          }) = UpdateMovieInput;

          const factory Movie.upsertMovieInput({
            required String id,
            required String title,
          }) = UpsertMovieInput;

          factory Movie.fromJson(Map<String, dynamic> json) => _$MovieFromJson(json);
        }

        @unfreezed
        class CreateMovieInput with _$CreateMovieInput {
          const CreateMovieInput._();

          const factory CreateMovieInput({
            required String title,
          }) = _CreateMovieInput;

          factory CreateMovieInput.fromJson(Map<String, dynamic> json) => _$CreateMovieInputFromJson(json);
        }

        @unfreezed
        class UpsertMovieInput with _$UpsertMovieInput {
          const UpsertMovieInput._();

          const factory UpsertMovieInput({
            required String id,
            required String title,
          }) = _UpsertMovieInput;

          factory UpsertMovieInput.fromJson(Map<String, dynamic> json) => _$UpsertMovieInputFromJson(json);
        }

        @unfreezed
        class UpdateMovieInput with _$UpdateMovieInput {
          const UpdateMovieInput._();

          const factory UpdateMovieInput({
            required String id,
            String? title,
          }) = _UpdateMovieInput;

          factory UpdateMovieInput.fromJson(Map<String, dynamic> json) => _$UpdateMovieInputFromJson(json);
        }

        @unfreezed
        class DeleteMovieInput with _$DeleteMovieInput {
          const DeleteMovieInput._();

          const factory DeleteMovieInput({
            required String id,
          }) = _DeleteMovieInput;

          factory DeleteMovieInput.fromJson(Map<String, dynamic> json) => _$DeleteMovieInputFromJson(json);
        }"
      `);
    });

    it('using unionTypes: generates the expected output', () => {
      const output = plugin(unionSchema, [], Config.create({}));
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        enum Episode {
          @JsonKey(name: 'NEWHOPE')
          newhope,
          @JsonKey(name: 'EMPIRE')
          empire,
          @JsonKey(name: 'JEDI')
          jedi,
        }

        @freezed
        class Actor with _$Actor {
          const Actor._();

          const factory Actor({
            required String name,
            required List<Episode?> appearsIn,
          }) = _Actor;

          factory Actor.fromJson(Map<String, dynamic> json) => _$ActorFromJson(json);
        }

        @freezed
        class Starship with _$Starship {
          const Starship._();

          const factory Starship({
            required String id,
            required String name,
            double? length,
          }) = _Starship;

          factory Starship.fromJson(Map<String, dynamic> json) => _$StarshipFromJson(json);
        }

        @freezed
        class Human with _$Human {
          const Human._();

          const factory Human({
            required String id,
            required String name,
            List<Actor?>? friends,
            required List<Episode?> appearsIn,
            int? totalCredits,
          }) = _Human;

          factory Human.fromJson(Map<String, dynamic> json) => _$HumanFromJson(json);
        }

        @freezed
        class Droid with _$Droid {
          const Droid._();

          const factory Droid({
            required String id,
            required String name,
            List<Actor?>? friends,
            required List<Episode?> appearsIn,
            String? primaryFunction,
          }) = _Droid;

          factory Droid.fromJson(Map<String, dynamic> json) => _$DroidFromJson(json);
        }

        @freezed
        class SearchResult with _$SearchResult {
          const SearchResult._();

          const factory SearchResult.human({
            required String id,
            required String name,
            List<Actor?>? friends,
            required List<Episode?> appearsIn,
            int? totalCredits,
          }) = Human;

          const factory SearchResult.droid({
            required String id,
            required String name,
            List<Actor?>? friends,
            required List<Episode?> appearsIn,
            String? primaryFunction,
          }) = Droid;

          const factory SearchResult.starship({
            required String id,
            required String name,
            double? length,
          }) = Starship;

          factory SearchResult.fromJson(Map<String, dynamic> json) => _$SearchResultFromJson(json);
        }"
      `);
    });

    it('works with cyclic schema: generates the expected output', () => {
      const output = plugin(cyclicSchema, [], Config.create({}));
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @unfreezed
        class BaseAInput with _$BaseAInput {
          const BaseAInput._();

          const factory BaseAInput({
            required BaseBInput b,
          }) = _BaseAInput;

          factory BaseAInput.fromJson(Map<String, dynamic> json) => _$BaseAInputFromJson(json);
        }

        @unfreezed
        class BaseBInput with _$BaseBInput {
          const BaseBInput._();

          const factory BaseBInput({
            required BaseCInput c,
          }) = _BaseBInput;

          factory BaseBInput.fromJson(Map<String, dynamic> json) => _$BaseBInputFromJson(json);
        }

        @unfreezed
        class BaseCInput with _$BaseCInput {
          const BaseCInput._();

          const factory BaseCInput({
            required BaseAInput a,
          }) = _BaseCInput;

          factory BaseCInput.fromJson(Map<String, dynamic> json) => _$BaseCInputFromJson(json);
        }

        @freezed
        class Base with _$Base {
          const Base._();

          const factory Base({
            String? id,
          }) = _Base;

          factory Base.fromJson(Map<String, dynamic> json) => _$BaseFromJson(json);
        }"
      `);
    });

    it('escapes types with Dart keywords: generates the expected output', () => {
      const output = plugin(escapedSchema, [], Config.create({}));
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @unfreezed
        class Enum_ with _$Enum_ {
          const Enum_._();

          const factory Enum_({
            @JsonKey(name: 'is')
            String? is_,
            @JsonKey(name: 'in')
            String? in_,
          }) = _Enum_;

          factory Enum_.fromJson(Map<String, dynamic> json) => _$Enum_FromJson(json);
        }

        @unfreezed
        class List_ with _$List_ {
          const List_._();

          const factory List_({
            String? map,
            @JsonKey(name: 'implements')
            String? implements_,
            @JsonKey(name: 'extends')
            required String extends_,
          }) = _List_;

          factory List_.fromJson(Map<String, dynamic> json) => _$List_FromJson(json);
        }

        @freezed
        class Object_ with _$Object_ {
          const Object_._();

          const factory Object_.enum_({
            @JsonKey(name: 'is')
            String? is_,
            @JsonKey(name: 'in')
            String? in_,
          }) = Enum_;

          const factory Object_.list({
            String? map,
            @JsonKey(name: 'implements')
            String? implements_,
            @JsonKey(name: 'extends')
            required String extends_,
          }) = List_;

          factory Object_.fromJson(Map<String, dynamic> json) => _$Object_FromJson(json);
        }"
      `);
    });

    it('handles custom scalars and nested lists: generates the expected output', () => {
      const output = plugin(nonNullableListWithCustomScalars, [], Config.create({}));
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @freezed
        class ComplexType with _$ComplexType {
          const ComplexType._();

          const factory ComplexType({
            List<String?>? a,
            List<String>? b,
            required List<bool> c,
            List<List<int?>?>? d,
            List<List<double?>>? e,
            required List<List<String?>> f,
            jsonb? g,
            required timestamp h,
            required UUID i,
          }) = _ComplexType;

          factory ComplexType.fromJson(Map<String, dynamic> json) => _$ComplexTypeFromJson(json);
        }"
      `);
    });

    it('using unionTypes: applying config: generates the expected output', () => {
      const output = plugin(
        unionSchema,
        [],
        Config.create({
          defaultValues: [
            [
              FieldNamePattern.forFieldNamesOfAllTypeNames([friends]),
              '[]',
              ['union_factory_parameter'],
            ],
            [
              FieldNamePattern.forFieldNamesOfAllTypeNames([appearsIn]),
              '[]',
              ['default_factory_parameter'],
            ],
          ],
          deprecated: [
            [FieldNamePattern.forAllFieldNamesOfTypeName([Actor]), ['default_factory_parameter']],
            [TypeNamePattern.forTypeNames(SearchResultDroid), ['union_factory']],
          ],
          final: [[FieldNamePattern.forFieldNamesOfAllTypeNames([id, name]), ['parameter']]],
          // fromJsonToJson: [
          //   [
          //     FieldNamePattern.forFieldNamesOfTypeName([[Starship, length]]),
          //     'imperialUnit',
          //     false,
          //     ['default_factory_parameter'],
          //   ],
          //   [
          //     FieldNamePattern.forFieldNamesOfTypeName([[Starship, length]]),
          //     'metricUnit',
          //     true,
          //     ['union_factory_parameter'],
          //   ],
          // ],
          mergeTypes: {
            [Human.value]: [Actor],
            [Actor.value]: [Human],
          },
          immutable: TypeNamePattern.forAllTypeNamesExcludeTypeNames([Actor, Human]),
        }),
      );
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        enum Episode {
          @JsonKey(name: 'NEWHOPE')
          newhope,
          @JsonKey(name: 'EMPIRE')
          empire,
          @JsonKey(name: 'JEDI')
          jedi,
        }

        @unfreezed
        class Actor with _$Actor {
          const Actor._();

          factory Actor({
            @deprecated
            required final String name,
            @deprecated
            @Default([])
            required List<Episode?> appearsIn,
          }) = _Actor;

          const factory Actor.human({
            required final String id,
            required final String name,
            List<Actor?>? friends,
            required List<Episode?> appearsIn,
            int? totalCredits,
          }) = Human;

          factory Actor.fromJson(Map<String, dynamic> json) => _$ActorFromJson(json);
        }

        @freezed
        class Starship with _$Starship {
          const Starship._();

          const factory Starship({
            required final String id,
            required final String name,
            double? length,
          }) = _Starship;

          factory Starship.fromJson(Map<String, dynamic> json) => _$StarshipFromJson(json);
        }

        @unfreezed
        class Human with _$Human {
          const Human._();

          factory Human({
            required final String id,
            required final String name,
            List<Actor?>? friends,
            @Default([])
            required List<Episode?> appearsIn,
            int? totalCredits,
          }) = _Human;

          const factory Human.actor({
            required final String name,
            required List<Episode?> appearsIn,
          }) = Actor;

          factory Human.fromJson(Map<String, dynamic> json) => _$HumanFromJson(json);
        }

        @freezed
        class Droid with _$Droid {
          const Droid._();

          const factory Droid({
            required final String id,
            required final String name,
            List<Actor?>? friends,
            @Default([])
            required List<Episode?> appearsIn,
            String? primaryFunction,
          }) = _Droid;

          factory Droid.fromJson(Map<String, dynamic> json) => _$DroidFromJson(json);
        }

        @freezed
        class SearchResult with _$SearchResult {
          const SearchResult._();

          const factory SearchResult.human({
            required final String id,
            required final String name,
            @Default([])
            List<Actor?>? friends,
            required List<Episode?> appearsIn,
            int? totalCredits,
          }) = Human;

          @deprecated
          const factory SearchResult.droid({
            required final String id,
            required final String name,
            @Default([])
            List<Actor?>? friends,
            required List<Episode?> appearsIn,
            String? primaryFunction,
          }) = Droid;

          const factory SearchResult.starship({
            required final String id,
            required final String name,
            double? length,
          }) = Starship;

          factory SearchResult.fromJson(Map<String, dynamic> json) => _$SearchResultFromJson(json);
        }"
      `);
    });
  });
});
