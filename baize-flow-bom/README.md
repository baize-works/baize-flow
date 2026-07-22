# Introduction

The `baize-flow-bom` module is used to manage the version of third part dependencies. If you want to import
`baize-flow-xx` to your project, you need to import `baize-flow-bom` together by below way,
this can help you to manage the version.

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.baize-flow</groupId>
            <artifactId>baize-flow-bom</artifactId>
            <version>${baize-flow.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

If you want to override the version defined in `baize-flow-bom` you can directly add the version at your
module's `dependencyManagement`.
