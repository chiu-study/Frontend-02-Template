学习笔记
#### 运算符和表达式
如果是Call 中调用引用（点运算）expressions member运算也会降级为Call运算
注意Left Handside 和 Right Handside ,eg:a.b = c  a + b = c
Update expressions:自增自减
`**` 乘方 -> 后运算  
#### 类型转换
`==` 类型不同时，大多数 先转为number再进行比较
拆箱转换:

ToPremitive

ToString vs valueOf

[Symbol.toPrimitive](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive) (忽略toString 和 valueOf)

#### Completion Record
[[type]]:normal, break, continue, return ,or throw
[[value]]:基本类型
[[target]]: label

lexical environment: this、new.target、super、变量
variable environment: 历史遗留，仅处理var声明

`Realm`:在js中，函数表达式和对象直接量俊会创建对象,隐式转换也会创建对象 ，这些对象也是有原型的，没有realm就不知道它们的原型是什么

tc39: [https://github.com/tc39/proposal-realms#WhatareRealms](https://github.com/tc39/proposal-realms#WhatareRealms)