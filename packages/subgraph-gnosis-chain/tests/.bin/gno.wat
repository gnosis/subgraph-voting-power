(module
  (type (;0;) (func (param i32) (result i32)))
  (type (;1;) (func (param i32 i32) (result i32)))
  (type (;2;) (func (param i32 i32 i32)))
  (type (;3;) (func (param i32 i32)))
  (type (;4;) (func))
  (type (;5;) (func (param i32)))
  (type (;6;) (func (param i32 i32 i32 i32)))
  (type (;7;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;8;) (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;9;) (func (param i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
  (type (;10;) (func (param i32 i32 i32) (result i32)))
  (type (;11;) (func (param i32 i32 i32 i32) (result i32)))
  (import "env" "abort" (func $~lib/builtins/abort (type 6)))
  (import "conversion" "typeConversion.stringToH160" (func $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.stringToH160 (type 0)))
  (import "numbers" "bigDecimal.fromString" (func $~lib/@graphprotocol/graph-ts/common/numbers/bigDecimal.fromString (type 0)))
  (import "index" "store.set" (func $~lib/@graphprotocol/graph-ts/index/store.set (type 2)))
  (import "conversion" "typeConversion.bytesToHex" (func $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.bytesToHex (type 0)))
  (import "index" "store.get" (func $~lib/@graphprotocol/graph-ts/index/store.get (type 1)))
  (import "numbers" "bigInt.minus" (func $~lib/@graphprotocol/graph-ts/common/numbers/bigInt.minus (type 1)))
  (import "index" "store.remove" (func $~lib/@graphprotocol/graph-ts/index/store.remove (type 3)))
  (import "numbers" "bigInt.plus" (func $~lib/@graphprotocol/graph-ts/common/numbers/bigInt.plus (type 1)))
  (import "assert" "_assert.fieldEquals" (func $~lib/matchstick-as/assembly/assert/_assert.fieldEquals (type 11)))
  (import "store" "clearStore" (func $~lib/matchstick-as/assembly/store/clearStore (type 4)))
  (import "index" "_registerTest" (func $~lib/matchstick-as/assembly/index/_registerTest (type 2)))
  (func $~lib/rt/stub/__alloc (type 0) (param i32) (result i32)
    (local i32 i32 i32 i32 i32)
    local.get 0
    i32.const 1073741820
    i32.gt_u
    if  ;; label = @1
      i32.const 1056
      i32.const 1120
      i32.const 33
      i32.const 29
      call $~lib/builtins/abort
      unreachable
    end
    global.get $~lib/rt/stub/offset
    local.tee 3
    i32.const 4
    i32.add
    local.tee 4
    local.get 0
    i32.const 19
    i32.add
    i32.const -16
    i32.and
    i32.const 4
    i32.sub
    local.tee 5
    i32.add
    local.tee 0
    memory.size
    local.tee 2
    i32.const 16
    i32.shl
    i32.const 15
    i32.add
    i32.const -16
    i32.and
    local.tee 1
    i32.gt_u
    if  ;; label = @1
      local.get 2
      local.get 0
      local.get 1
      i32.sub
      i32.const 65535
      i32.add
      i32.const -65536
      i32.and
      i32.const 16
      i32.shr_u
      local.tee 1
      local.get 1
      local.get 2
      i32.lt_s
      select
      memory.grow
      i32.const 0
      i32.lt_s
      if  ;; label = @2
        local.get 1
        memory.grow
        i32.const 0
        i32.lt_s
        if  ;; label = @3
          unreachable
        end
      end
    end
    local.get 0
    global.set $~lib/rt/stub/offset
    local.get 3
    local.get 5
    i32.store
    local.get 4)
  (func $~lib/rt/stub/__new (type 1) (param i32 i32) (result i32)
    (local i32 i32)
    local.get 0
    i32.const 1073741804
    i32.gt_u
    if  ;; label = @1
      i32.const 1056
      i32.const 1120
      i32.const 86
      i32.const 30
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0
    i32.const 16
    i32.add
    call $~lib/rt/stub/__alloc
    local.tee 3
    i32.const 4
    i32.sub
    local.tee 2
    i32.const 0
    i32.store offset=4
    local.get 2
    i32.const 0
    i32.store offset=8
    local.get 2
    local.get 1
    i32.store offset=12
    local.get 2
    local.get 0
    i32.store offset=16
    local.get 3
    i32.const 16
    i32.add)
  (func $~lib/memory/memory.fill (type 3) (param i32 i32)
    (local i32)
    block  ;; label = @1
      local.get 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      i32.store8
      local.get 0
      local.get 1
      i32.add
      local.tee 2
      i32.const 1
      i32.sub
      i32.const 0
      i32.store8
      local.get 1
      i32.const 2
      i32.le_u
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      i32.store8 offset=1
      local.get 0
      i32.const 0
      i32.store8 offset=2
      local.get 2
      i32.const 2
      i32.sub
      i32.const 0
      i32.store8
      local.get 2
      i32.const 3
      i32.sub
      i32.const 0
      i32.store8
      local.get 1
      i32.const 6
      i32.le_u
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      i32.store8 offset=3
      local.get 2
      i32.const 4
      i32.sub
      i32.const 0
      i32.store8
      local.get 1
      i32.const 8
      i32.le_u
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      local.get 0
      i32.sub
      i32.const 3
      i32.and
      local.tee 2
      i32.add
      local.tee 0
      i32.const 0
      i32.store
      local.get 0
      local.get 1
      local.get 2
      i32.sub
      i32.const -4
      i32.and
      local.tee 2
      i32.add
      local.tee 1
      i32.const 4
      i32.sub
      i32.const 0
      i32.store
      local.get 2
      i32.const 8
      i32.le_u
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      i32.store offset=4
      local.get 0
      i32.const 0
      i32.store offset=8
      local.get 1
      i32.const 12
      i32.sub
      i32.const 0
      i32.store
      local.get 1
      i32.const 8
      i32.sub
      i32.const 0
      i32.store
      local.get 2
      i32.const 24
      i32.le_u
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      i32.store offset=12
      local.get 0
      i32.const 0
      i32.store offset=16
      local.get 0
      i32.const 0
      i32.store offset=20
      local.get 0
      i32.const 0
      i32.store offset=24
      local.get 1
      i32.const 28
      i32.sub
      i32.const 0
      i32.store
      local.get 1
      i32.const 24
      i32.sub
      i32.const 0
      i32.store
      local.get 1
      i32.const 20
      i32.sub
      i32.const 0
      i32.store
      local.get 1
      i32.const 16
      i32.sub
      i32.const 0
      i32.store
      local.get 0
      local.get 0
      i32.const 4
      i32.and
      i32.const 24
      i32.add
      local.tee 1
      i32.add
      local.set 0
      local.get 2
      local.get 1
      i32.sub
      local.set 1
      loop  ;; label = @2
        local.get 1
        i32.const 32
        i32.ge_u
        if  ;; label = @3
          local.get 0
          i64.const 0
          i64.store
          local.get 0
          i64.const 0
          i64.store offset=8
          local.get 0
          i64.const 0
          i64.store offset=16
          local.get 0
          i64.const 0
          i64.store offset=24
          local.get 1
          i32.const 32
          i32.sub
          local.set 1
          local.get 0
          i32.const 32
          i32.add
          local.set 0
          br 1 (;@2;)
        end
      end
    end)
  (func $~lib/@graphprotocol/graph-ts/common/collections/Entity#constructor (type 0) (param i32) (result i32)
    (local i32 i32)
    block (result i32)  ;; label = @1
      block (result i32)  ;; label = @2
        local.get 0
        i32.eqz
        if  ;; label = @3
          i32.const 4
          i32.const 4
          call $~lib/rt/stub/__new
          local.set 0
        end
        local.get 0
      end
      i32.eqz
      if  ;; label = @2
        i32.const 4
        i32.const 6
        call $~lib/rt/stub/__new
        local.set 0
      end
      local.get 0
    end
    i32.const 0
    i32.store
    i32.const 16
    i32.const 8
    call $~lib/rt/stub/__new
    local.tee 1
    i32.const 0
    i32.store
    local.get 1
    i32.const 0
    i32.store offset=4
    local.get 1
    i32.const 0
    i32.store offset=8
    local.get 1
    i32.const 0
    i32.store offset=12
    i32.const 32
    i32.const 0
    call $~lib/rt/stub/__new
    local.tee 2
    i32.const 32
    call $~lib/memory/memory.fill
    local.get 1
    local.get 2
    i32.store
    local.get 1
    local.get 2
    i32.store offset=4
    local.get 1
    i32.const 32
    i32.store offset=8
    local.get 1
    i32.const 0
    i32.store offset=12
    local.get 0
    local.get 1
    i32.store
    local.get 0)
  (func $~lib/typedarray/Uint8Array#__set (type 2) (param i32 i32 i32)
    local.get 1
    local.get 0
    i32.load offset=8
    i32.ge_u
    if  ;; label = @1
      i32.const 1616
      i32.const 1680
      i32.const 175
      i32.const 45
      call $~lib/builtins/abort
      unreachable
    end
    local.get 1
    local.get 0
    i32.load offset=4
    i32.add
    local.get 2
    i32.store8)
  (func $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32 (type 0) (param i32) (result i32)
    (local i32 i32)
    block (result i32)  ;; label = @1
      block (result i32)  ;; label = @2
        i32.const 12
        i32.const 11
        call $~lib/rt/stub/__new
        local.tee 1
        i32.eqz
        if  ;; label = @3
          i32.const 12
          i32.const 12
          call $~lib/rt/stub/__new
          local.set 1
        end
        local.get 1
      end
      i32.eqz
      if  ;; label = @2
        i32.const 12
        i32.const 2
        call $~lib/rt/stub/__new
        local.set 1
      end
      local.get 1
    end
    i32.const 0
    i32.store
    local.get 1
    i32.const 0
    i32.store offset=4
    local.get 1
    i32.const 0
    i32.store offset=8
    i32.const 4
    i32.const 0
    call $~lib/rt/stub/__new
    local.tee 2
    i32.const 4
    call $~lib/memory/memory.fill
    local.get 1
    local.get 2
    i32.store
    local.get 1
    local.get 2
    i32.store offset=4
    local.get 1
    i32.const 4
    i32.store offset=8
    local.get 1
    i32.const 0
    local.get 0
    i32.const 255
    i32.and
    call $~lib/typedarray/Uint8Array#__set
    local.get 1
    i32.const 1
    local.get 0
    i32.const 8
    i32.shr_s
    i32.const 255
    i32.and
    call $~lib/typedarray/Uint8Array#__set
    local.get 1
    i32.const 2
    local.get 0
    i32.const 16
    i32.shr_s
    i32.const 255
    i32.and
    call $~lib/typedarray/Uint8Array#__set
    local.get 1
    i32.const 3
    local.get 0
    i32.const 24
    i32.shr_s
    call $~lib/typedarray/Uint8Array#__set
    local.get 1)
  (func $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Block#constructor (type 7) (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)
    (local i32)
    i32.const 60
    i32.const 14
    call $~lib/rt/stub/__new
    local.tee 15
    local.get 0
    i32.store
    local.get 15
    local.get 1
    i32.store offset=4
    local.get 15
    local.get 2
    i32.store offset=8
    local.get 15
    local.get 3
    i32.store offset=12
    local.get 15
    local.get 4
    i32.store offset=16
    local.get 15
    local.get 5
    i32.store offset=20
    local.get 15
    local.get 6
    i32.store offset=24
    local.get 15
    local.get 7
    i32.store offset=28
    local.get 15
    local.get 8
    i32.store offset=32
    local.get 15
    local.get 9
    i32.store offset=36
    local.get 15
    local.get 10
    i32.store offset=40
    local.get 15
    local.get 11
    i32.store offset=44
    local.get 15
    local.get 12
    i32.store offset=48
    local.get 15
    local.get 13
    i32.store offset=52
    local.get 15
    local.get 14
    i32.store offset=56
    local.get 15)
  (func $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Transaction#constructor (type 8) (param i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)
    (local i32)
    i32.const 36
    i32.const 15
    call $~lib/rt/stub/__new
    local.tee 9
    local.get 0
    i32.store
    local.get 9
    local.get 1
    i32.store offset=4
    local.get 9
    local.get 2
    i32.store offset=8
    local.get 9
    local.get 3
    i32.store offset=12
    local.get 9
    local.get 4
    i32.store offset=16
    local.get 9
    local.get 5
    i32.store offset=20
    local.get 9
    local.get 6
    i32.store offset=24
    local.get 9
    local.get 7
    i32.store offset=28
    local.get 9
    local.get 8
    i32.store offset=32
    local.get 9)
  (func $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#__get (type 1) (param i32 i32) (result i32)
    local.get 1
    local.get 0
    i32.load offset=12
    i32.ge_u
    if  ;; label = @1
      i32.const 1616
      i32.const 1392
      i32.const 106
      i32.const 42
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0
    i32.load offset=4
    local.get 1
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee 0
    i32.eqz
    if  ;; label = @1
      i32.const 2416
      i32.const 1392
      i32.const 110
      i32.const 40
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0)
  (func $~lib/string/String.__eq (type 1) (param i32 i32) (result i32)
    (local i32 i32 i32)
    local.get 0
    local.get 1
    i32.eq
    if  ;; label = @1
      i32.const 1
      return
    end
    local.get 1
    i32.const 0
    local.get 0
    select
    i32.eqz
    if  ;; label = @1
      i32.const 0
      return
    end
    local.get 0
    i32.const 20
    i32.sub
    i32.load offset=16
    i32.const 1
    i32.shr_u
    local.tee 4
    local.get 1
    i32.const 20
    i32.sub
    i32.load offset=16
    i32.const 1
    i32.shr_u
    i32.ne
    if  ;; label = @1
      i32.const 0
      return
    end
    block (result i32)  ;; label = @1
      local.get 0
      local.set 2
      local.get 1
      local.set 3
      local.get 2
      i32.const 7
      i32.and
      local.get 3
      i32.const 7
      i32.and
      i32.or
      i32.const 1
      local.get 4
      local.tee 0
      i32.const 4
      i32.ge_u
      select
      i32.eqz
      if  ;; label = @2
        loop  ;; label = @3
          local.get 2
          i64.load
          local.get 3
          i64.load
          i64.eq
          if  ;; label = @4
            local.get 2
            i32.const 8
            i32.add
            local.set 2
            local.get 3
            i32.const 8
            i32.add
            local.set 3
            local.get 0
            i32.const 4
            i32.sub
            local.tee 0
            i32.const 4
            i32.ge_u
            br_if 1 (;@3;)
          end
        end
      end
      loop  ;; label = @2
        local.get 0
        local.tee 1
        i32.const 1
        i32.sub
        local.set 0
        local.get 1
        if  ;; label = @3
          local.get 2
          i32.load16_u
          local.tee 1
          local.get 3
          i32.load16_u
          local.tee 4
          i32.ne
          if  ;; label = @4
            local.get 1
            local.get 4
            i32.sub
            br 3 (;@1;)
          end
          local.get 2
          i32.const 2
          i32.add
          local.set 2
          local.get 3
          i32.const 2
          i32.add
          local.set 3
          br 1 (;@2;)
        end
      end
      i32.const 0
    end
    i32.eqz)
  (func $~lib/util/memory/memcpy (type 2) (param i32 i32 i32)
    (local i32 i32 i32)
    loop  ;; label = @1
      local.get 1
      i32.const 3
      i32.and
      i32.const 0
      local.get 2
      select
      if  ;; label = @2
        local.get 0
        local.tee 3
        i32.const 1
        i32.add
        local.set 0
        local.get 1
        local.tee 4
        i32.const 1
        i32.add
        local.set 1
        local.get 3
        local.get 4
        i32.load8_u
        i32.store8
        local.get 2
        i32.const 1
        i32.sub
        local.set 2
        br 1 (;@1;)
      end
    end
    local.get 0
    i32.const 3
    i32.and
    i32.eqz
    if  ;; label = @1
      loop  ;; label = @2
        local.get 2
        i32.const 16
        i32.ge_u
        if  ;; label = @3
          local.get 0
          local.get 1
          i32.load
          i32.store
          local.get 0
          local.get 1
          i32.load offset=4
          i32.store offset=4
          local.get 0
          local.get 1
          i32.load offset=8
          i32.store offset=8
          local.get 0
          local.get 1
          i32.load offset=12
          i32.store offset=12
          local.get 1
          i32.const 16
          i32.add
          local.set 1
          local.get 0
          i32.const 16
          i32.add
          local.set 0
          local.get 2
          i32.const 16
          i32.sub
          local.set 2
          br 1 (;@2;)
        end
      end
      local.get 2
      i32.const 8
      i32.and
      if  ;; label = @2
        block (result i32)  ;; label = @3
          local.get 0
          local.get 1
          i32.load
          i32.store
          local.get 0
          local.get 1
          i32.load offset=4
          i32.store offset=4
          local.get 1
          i32.const 8
          i32.add
          local.set 1
          local.get 0
          i32.const 8
          i32.add
        end
        local.set 0
      end
      local.get 2
      i32.const 4
      i32.and
      if  ;; label = @2
        block (result i32)  ;; label = @3
          local.get 0
          local.get 1
          i32.load
          i32.store
          local.get 1
          i32.const 4
          i32.add
          local.set 1
          local.get 0
          i32.const 4
          i32.add
        end
        local.set 0
      end
      local.get 2
      i32.const 2
      i32.and
      if  ;; label = @2
        block (result i32)  ;; label = @3
          local.get 0
          local.get 1
          i32.load16_u
          i32.store16
          local.get 1
          i32.const 2
          i32.add
          local.set 1
          local.get 0
          i32.const 2
          i32.add
        end
        local.set 0
      end
      local.get 2
      i32.const 1
      i32.and
      if  ;; label = @2
        local.get 0
        local.get 1
        i32.load8_u
        i32.store8
      end
      return
    end
    local.get 2
    i32.const 32
    i32.ge_u
    if  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 0
              i32.const 3
              i32.and
              i32.const 1
              i32.sub
              br_table 0 (;@5;) 1 (;@4;) 2 (;@3;) 3 (;@2;)
            end
            local.get 1
            i32.load
            local.set 5
            local.get 0
            local.get 1
            i32.load8_u
            i32.store8
            local.get 0
            i32.const 1
            i32.add
            local.tee 0
            local.get 1
            i32.const 1
            i32.add
            local.tee 1
            i32.load8_u
            i32.store8
            local.get 0
            local.tee 4
            i32.const 2
            i32.add
            local.set 0
            local.get 1
            local.tee 3
            i32.const 2
            i32.add
            local.set 1
            local.get 4
            local.get 3
            i32.load8_u offset=1
            i32.store8 offset=1
            local.get 2
            i32.const 3
            i32.sub
            local.set 2
            loop  ;; label = @5
              local.get 2
              i32.const 17
              i32.ge_u
              if  ;; label = @6
                local.get 0
                local.get 1
                i32.load offset=1
                local.tee 3
                i32.const 8
                i32.shl
                local.get 5
                i32.const 24
                i32.shr_u
                i32.or
                i32.store
                local.get 0
                local.get 3
                i32.const 24
                i32.shr_u
                local.get 1
                i32.load offset=5
                local.tee 3
                i32.const 8
                i32.shl
                i32.or
                i32.store offset=4
                local.get 0
                local.get 3
                i32.const 24
                i32.shr_u
                local.get 1
                i32.load offset=9
                local.tee 3
                i32.const 8
                i32.shl
                i32.or
                i32.store offset=8
                local.get 0
                local.get 1
                i32.load offset=13
                local.tee 5
                i32.const 8
                i32.shl
                local.get 3
                i32.const 24
                i32.shr_u
                i32.or
                i32.store offset=12
                local.get 1
                i32.const 16
                i32.add
                local.set 1
                local.get 0
                i32.const 16
                i32.add
                local.set 0
                local.get 2
                i32.const 16
                i32.sub
                local.set 2
                br 1 (;@5;)
              end
            end
            br 2 (;@2;)
          end
          local.get 1
          i32.load
          local.set 5
          local.get 0
          local.get 1
          i32.load8_u
          i32.store8
          local.get 0
          local.tee 4
          i32.const 2
          i32.add
          local.set 0
          local.get 1
          local.tee 3
          i32.const 2
          i32.add
          local.set 1
          local.get 4
          local.get 3
          i32.load8_u offset=1
          i32.store8 offset=1
          local.get 2
          i32.const 2
          i32.sub
          local.set 2
          loop  ;; label = @4
            local.get 2
            i32.const 18
            i32.ge_u
            if  ;; label = @5
              local.get 0
              local.get 1
              i32.load offset=2
              local.tee 3
              i32.const 16
              i32.shl
              local.get 5
              i32.const 16
              i32.shr_u
              i32.or
              i32.store
              local.get 0
              local.get 3
              i32.const 16
              i32.shr_u
              local.get 1
              i32.load offset=6
              local.tee 3
              i32.const 16
              i32.shl
              i32.or
              i32.store offset=4
              local.get 0
              local.get 3
              i32.const 16
              i32.shr_u
              local.get 1
              i32.load offset=10
              local.tee 3
              i32.const 16
              i32.shl
              i32.or
              i32.store offset=8
              local.get 0
              local.get 1
              i32.load offset=14
              local.tee 5
              i32.const 16
              i32.shl
              local.get 3
              i32.const 16
              i32.shr_u
              i32.or
              i32.store offset=12
              local.get 1
              i32.const 16
              i32.add
              local.set 1
              local.get 0
              i32.const 16
              i32.add
              local.set 0
              local.get 2
              i32.const 16
              i32.sub
              local.set 2
              br 1 (;@4;)
            end
          end
          br 1 (;@2;)
        end
        local.get 1
        i32.load
        local.set 5
        local.get 0
        local.tee 3
        i32.const 1
        i32.add
        local.set 0
        local.get 1
        local.tee 4
        i32.const 1
        i32.add
        local.set 1
        local.get 3
        local.get 4
        i32.load8_u
        i32.store8
        local.get 2
        i32.const 1
        i32.sub
        local.set 2
        loop  ;; label = @3
          local.get 2
          i32.const 19
          i32.ge_u
          if  ;; label = @4
            local.get 0
            local.get 1
            i32.load offset=3
            local.tee 3
            i32.const 24
            i32.shl
            local.get 5
            i32.const 8
            i32.shr_u
            i32.or
            i32.store
            local.get 0
            local.get 3
            i32.const 8
            i32.shr_u
            local.get 1
            i32.load offset=7
            local.tee 3
            i32.const 24
            i32.shl
            i32.or
            i32.store offset=4
            local.get 0
            local.get 3
            i32.const 8
            i32.shr_u
            local.get 1
            i32.load offset=11
            local.tee 3
            i32.const 24
            i32.shl
            i32.or
            i32.store offset=8
            local.get 0
            local.get 1
            i32.load offset=15
            local.tee 5
            i32.const 24
            i32.shl
            local.get 3
            i32.const 8
            i32.shr_u
            i32.or
            i32.store offset=12
            local.get 1
            i32.const 16
            i32.add
            local.set 1
            local.get 0
            i32.const 16
            i32.add
            local.set 0
            local.get 2
            i32.const 16
            i32.sub
            local.set 2
            br 1 (;@3;)
          end
        end
      end
    end
    local.get 2
    i32.const 16
    i32.and
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      local.tee 4
      i32.const 2
      i32.add
      local.set 0
      local.get 1
      local.tee 3
      i32.const 2
      i32.add
      local.set 1
      local.get 4
      local.get 3
      i32.load8_u offset=1
      i32.store8 offset=1
    end
    local.get 2
    i32.const 8
    i32.and
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      local.tee 4
      i32.const 2
      i32.add
      local.set 0
      local.get 1
      local.tee 3
      i32.const 2
      i32.add
      local.set 1
      local.get 4
      local.get 3
      i32.load8_u offset=1
      i32.store8 offset=1
    end
    local.get 2
    i32.const 4
    i32.and
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.load8_u
      i32.store8
      local.get 0
      local.tee 4
      i32.const 2
      i32.add
      local.set 0
      local.get 1
      local.tee 3
      i32.const 2
      i32.add
      local.set 1
      local.get 4
      local.get 3
      i32.load8_u offset=1
      i32.store8 offset=1
    end
    local.get 2
    i32.const 2
    i32.and
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.load8_u
      i32.store8
      local.get 0
      local.tee 4
      i32.const 2
      i32.add
      local.set 0
      local.get 1
      local.tee 3
      i32.const 2
      i32.add
      local.set 1
      local.get 4
      local.get 3
      i32.load8_u offset=1
      i32.store8 offset=1
    end
    local.get 2
    i32.const 1
    i32.and
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.load8_u
      i32.store8
    end)
  (func $~lib/memory/memory.copy (type 2) (param i32 i32 i32)
    (local i32 i32)
    block  ;; label = @1
      local.get 2
      local.set 4
      local.get 0
      local.get 1
      i32.eq
      br_if 0 (;@1;)
      local.get 1
      local.get 0
      i32.sub
      local.get 4
      i32.sub
      i32.const 0
      local.get 4
      i32.const 1
      i32.shl
      i32.sub
      i32.le_u
      if  ;; label = @2
        local.get 0
        local.get 1
        local.get 4
        call $~lib/util/memory/memcpy
        br 1 (;@1;)
      end
      local.get 0
      local.get 1
      i32.lt_u
      if  ;; label = @2
        local.get 1
        i32.const 7
        i32.and
        local.get 0
        i32.const 7
        i32.and
        i32.eq
        if  ;; label = @3
          loop  ;; label = @4
            local.get 0
            i32.const 7
            i32.and
            if  ;; label = @5
              local.get 4
              i32.eqz
              br_if 4 (;@1;)
              local.get 4
              i32.const 1
              i32.sub
              local.set 4
              local.get 0
              local.tee 2
              i32.const 1
              i32.add
              local.set 0
              local.get 1
              local.tee 3
              i32.const 1
              i32.add
              local.set 1
              local.get 2
              local.get 3
              i32.load8_u
              i32.store8
              br 1 (;@4;)
            end
          end
          loop  ;; label = @4
            local.get 4
            i32.const 8
            i32.ge_u
            if  ;; label = @5
              local.get 0
              local.get 1
              i64.load
              i64.store
              local.get 4
              i32.const 8
              i32.sub
              local.set 4
              local.get 0
              i32.const 8
              i32.add
              local.set 0
              local.get 1
              i32.const 8
              i32.add
              local.set 1
              br 1 (;@4;)
            end
          end
        end
        loop  ;; label = @3
          local.get 4
          if  ;; label = @4
            local.get 0
            local.tee 2
            i32.const 1
            i32.add
            local.set 0
            local.get 1
            local.tee 3
            i32.const 1
            i32.add
            local.set 1
            local.get 2
            local.get 3
            i32.load8_u
            i32.store8
            local.get 4
            i32.const 1
            i32.sub
            local.set 4
            br 1 (;@3;)
          end
        end
      else
        local.get 1
        i32.const 7
        i32.and
        local.get 0
        i32.const 7
        i32.and
        i32.eq
        if  ;; label = @3
          loop  ;; label = @4
            local.get 0
            local.get 4
            i32.add
            i32.const 7
            i32.and
            if  ;; label = @5
              local.get 4
              i32.eqz
              br_if 4 (;@1;)
              local.get 4
              i32.const 1
              i32.sub
              local.tee 4
              local.get 0
              i32.add
              local.get 1
              local.get 4
              i32.add
              i32.load8_u
              i32.store8
              br 1 (;@4;)
            end
          end
          loop  ;; label = @4
            local.get 4
            i32.const 8
            i32.ge_u
            if  ;; label = @5
              local.get 4
              i32.const 8
              i32.sub
              local.tee 4
              local.get 0
              i32.add
              local.get 1
              local.get 4
              i32.add
              i64.load
              i64.store
              br 1 (;@4;)
            end
          end
        end
        loop  ;; label = @3
          local.get 4
          if  ;; label = @4
            local.get 4
            i32.const 1
            i32.sub
            local.tee 4
            local.get 0
            i32.add
            local.get 1
            local.get 4
            i32.add
            i32.load8_u
            i32.store8
            br 1 (;@3;)
          end
        end
      end
    end)
  (func $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#push (type 3) (param i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    local.get 0
    i32.load offset=12
    local.tee 10
    i32.const 1
    i32.add
    local.tee 11
    local.tee 4
    local.get 0
    i32.load offset=8
    local.tee 8
    i32.const 2
    i32.shr_u
    i32.gt_u
    if  ;; label = @1
      local.get 4
      i32.const 268435455
      i32.gt_u
      if  ;; label = @2
        i32.const 1344
        i32.const 1392
        i32.const 17
        i32.const 48
        call $~lib/builtins/abort
        unreachable
      end
      local.get 0
      i32.load
      local.tee 12
      local.set 5
      local.get 8
      i32.const 1
      i32.shl
      local.tee 2
      i32.const 1073741820
      local.get 2
      i32.const 1073741820
      i32.lt_u
      select
      local.tee 3
      local.get 4
      i32.const 8
      local.get 4
      i32.const 8
      i32.gt_u
      select
      i32.const 2
      i32.shl
      local.tee 2
      local.get 2
      local.get 3
      i32.lt_u
      select
      local.tee 7
      i32.const 1073741804
      i32.gt_u
      if  ;; label = @2
        i32.const 1056
        i32.const 1120
        i32.const 99
        i32.const 30
        call $~lib/builtins/abort
        unreachable
      end
      local.get 7
      i32.const 16
      i32.add
      local.set 4
      local.get 5
      i32.const 16
      i32.sub
      local.tee 3
      i32.const 15
      i32.and
      i32.const 1
      local.get 3
      select
      if  ;; label = @2
        i32.const 0
        i32.const 1120
        i32.const 45
        i32.const 3
        call $~lib/builtins/abort
        unreachable
      end
      global.get $~lib/rt/stub/offset
      local.get 3
      local.get 3
      i32.const 4
      i32.sub
      local.tee 9
      i32.load
      local.tee 5
      i32.add
      i32.eq
      local.set 2
      local.get 4
      i32.const 19
      i32.add
      i32.const -16
      i32.and
      i32.const 4
      i32.sub
      local.set 6
      local.get 4
      local.get 5
      i32.gt_u
      if  ;; label = @2
        local.get 2
        if  ;; label = @3
          local.get 4
          i32.const 1073741820
          i32.gt_u
          if  ;; label = @4
            i32.const 1056
            i32.const 1120
            i32.const 52
            i32.const 33
            call $~lib/builtins/abort
            unreachable
          end
          local.get 3
          local.get 6
          i32.add
          local.tee 4
          memory.size
          local.tee 5
          i32.const 16
          i32.shl
          i32.const 15
          i32.add
          i32.const -16
          i32.and
          local.tee 2
          i32.gt_u
          if  ;; label = @4
            local.get 5
            local.get 4
            local.get 2
            i32.sub
            i32.const 65535
            i32.add
            i32.const -65536
            i32.and
            i32.const 16
            i32.shr_u
            local.tee 2
            local.get 2
            local.get 5
            i32.lt_s
            select
            memory.grow
            i32.const 0
            i32.lt_s
            if  ;; label = @5
              local.get 2
              memory.grow
              i32.const 0
              i32.lt_s
              if  ;; label = @6
                unreachable
              end
            end
          end
          local.get 4
          global.set $~lib/rt/stub/offset
          local.get 9
          local.get 6
          i32.store
        else
          local.get 6
          local.get 5
          i32.const 1
          i32.shl
          local.tee 2
          local.get 2
          local.get 6
          i32.lt_u
          select
          call $~lib/rt/stub/__alloc
          local.tee 2
          local.get 3
          local.get 5
          call $~lib/memory/memory.copy
          local.get 2
          local.set 3
        end
      else
        local.get 2
        if  ;; label = @3
          local.get 3
          local.get 6
          i32.add
          global.set $~lib/rt/stub/offset
          local.get 9
          local.get 6
          i32.store
        end
      end
      local.get 3
      i32.const 4
      i32.sub
      local.get 7
      i32.store offset=16
      local.get 8
      local.get 3
      i32.const 16
      i32.add
      local.tee 2
      i32.add
      local.get 7
      local.get 8
      i32.sub
      call $~lib/memory/memory.fill
      local.get 2
      local.get 12
      i32.ne
      if  ;; label = @2
        local.get 0
        local.get 2
        i32.store
        local.get 0
        local.get 2
        i32.store offset=4
      end
      local.get 0
      local.get 7
      i32.store offset=8
    end
    local.get 0
    i32.load offset=4
    local.get 10
    i32.const 2
    i32.shl
    i32.add
    local.get 1
    i32.store
    local.get 0
    local.get 11
    i32.store offset=12)
  (func $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set (type 2) (param i32 i32 i32)
    (local i32 i32)
    block (result i32)  ;; label = @1
      local.get 0
      local.set 3
      loop  ;; label = @2
        local.get 4
        local.get 3
        i32.load
        i32.load offset=12
        i32.lt_s
        if  ;; label = @3
          local.get 3
          i32.load
          local.get 4
          call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#__get
          i32.load
          local.get 1
          call $~lib/string/String.__eq
          if  ;; label = @4
            local.get 3
            i32.load
            local.get 4
            call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#__get
            br 3 (;@1;)
          end
          local.get 4
          i32.const 1
          i32.add
          local.set 4
          br 1 (;@2;)
        end
      end
      i32.const 0
    end
    local.tee 3
    if  ;; label = @1
      local.get 3
      local.get 2
      i32.store offset=4
    else
      i32.const 8
      i32.const 7
      call $~lib/rt/stub/__new
      local.tee 3
      i32.const 0
      i32.store
      local.get 3
      i32.const 0
      i32.store offset=4
      local.get 3
      local.get 1
      i32.store
      local.get 3
      local.get 2
      i32.store offset=4
      local.get 0
      i32.load
      local.get 3
      call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#push
    end)
  (func $generated/schema/User#constructor (type 0) (param i32) (result i32)
    (local i64 i32 i32)
    i32.const 4
    i32.const 19
    call $~lib/rt/stub/__new
    call $~lib/@graphprotocol/graph-ts/common/collections/Entity#constructor
    local.tee 2
    local.set 3
    local.get 0
    i64.extend_i32_u
    local.set 1
    i32.const 16
    i32.const 5
    call $~lib/rt/stub/__new
    local.tee 0
    i32.const 0
    i32.store
    local.get 0
    local.get 1
    i64.store offset=8
    local.get 3
    i32.const 2384
    local.get 0
    call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set
    i32.const 0
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    i64.extend_i32_u
    local.set 1
    i32.const 16
    i32.const 5
    call $~lib/rt/stub/__new
    local.tee 0
    i32.const 7
    i32.store
    local.get 0
    local.get 1
    i64.store offset=8
    local.get 2
    i32.const 2544
    local.get 0
    call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set
    i32.const 0
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    i64.extend_i32_u
    local.set 1
    i32.const 16
    i32.const 5
    call $~lib/rt/stub/__new
    local.tee 0
    i32.const 7
    i32.store
    local.get 0
    local.get 1
    i64.store offset=8
    local.get 2
    i32.const 2592
    local.get 0
    call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set
    i32.const 0
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    i64.extend_i32_u
    local.set 1
    i32.const 16
    i32.const 5
    call $~lib/rt/stub/__new
    local.tee 0
    i32.const 7
    i32.store
    local.get 0
    local.get 1
    i64.store offset=8
    local.get 2
    i32.const 2624
    local.get 0
    call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set
    i32.const 0
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    i64.extend_i32_u
    local.set 1
    i32.const 16
    i32.const 5
    call $~lib/rt/stub/__new
    local.tee 0
    i32.const 7
    i32.store
    local.get 0
    local.get 1
    i64.store offset=8
    local.get 2
    i32.const 2656
    local.get 0
    call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set
    i32.const 0
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    i64.extend_i32_u
    local.set 1
    i32.const 16
    i32.const 5
    call $~lib/rt/stub/__new
    local.tee 0
    i32.const 7
    i32.store
    local.get 0
    local.get 1
    i64.store offset=8
    local.get 2
    i32.const 2688
    local.get 0
    call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set
    local.get 2)
  (func $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#get (type 1) (param i32 i32) (result i32)
    (local i32)
    loop  ;; label = @1
      local.get 2
      local.get 0
      i32.load
      i32.load offset=12
      i32.lt_s
      if  ;; label = @2
        local.get 0
        i32.load
        local.get 2
        call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#__get
        i32.load
        local.get 1
        call $~lib/string/String.__eq
        if  ;; label = @3
          local.get 0
          i32.load
          local.get 2
          call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#__get
          i32.load offset=4
          return
        end
        local.get 2
        i32.const 1
        i32.add
        local.set 2
        br 1 (;@1;)
      end
    end
    i32.const 0)
  (func $~lib/@graphprotocol/graph-ts/common/value/Value#toString (type 0) (param i32) (result i32)
    local.get 0
    i32.load
    if  ;; label = @1
      i32.const 3264
      i32.const 3328
      i32.const 59
      i32.const 5
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0
    i64.load offset=8
    i32.wrap_i64)
  (func $generated/schema/User#save (type 5) (param i32)
    (local i32 i32)
    local.get 0
    i32.const 2384
    call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#get
    local.tee 1
    i32.eqz
    if  ;; label = @1
      i32.const 2784
      i32.const 2880
      i32.const 28
      i32.const 5
      call $~lib/builtins/abort
      unreachable
    end
    local.get 1
    if  ;; label = @1
      local.get 1
      i32.load
      if  ;; label = @2
        i32.const 2940
        i32.load
        i32.const 1
        i32.shr_u
        i32.const 1
        i32.shl
        local.tee 1
        i32.const 3052
        i32.load
        i32.const 1
        i32.shr_u
        i32.const 1
        i32.shl
        local.tee 2
        i32.add
        local.tee 0
        if (result i32)  ;; label = @3
          local.get 0
          i32.const 1
          call $~lib/rt/stub/__new
          local.tee 0
          i32.const 2944
          local.get 1
          call $~lib/memory/memory.copy
          local.get 0
          local.get 1
          i32.add
          i32.const 3056
          local.get 2
          call $~lib/memory/memory.copy
          local.get 0
        else
          i32.const 3200
        end
        i32.const 2880
        i32.const 30
        i32.const 7
        call $~lib/builtins/abort
        unreachable
      end
      i32.const 3232
      local.get 1
      call $~lib/@graphprotocol/graph-ts/common/value/Value#toString
      local.get 0
      call $~lib/@graphprotocol/graph-ts/index/store.set
    end)
  (func $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Event#constructor (type 9) (param i32 i32 i32 i32 i32 i32 i32 i32) (result i32)
    block (result i32)  ;; label = @1
      local.get 0
      i32.eqz
      if  ;; label = @2
        i32.const 28
        i32.const 21
        call $~lib/rt/stub/__new
        local.set 0
      end
      local.get 0
    end
    local.get 1
    i32.store
    local.get 0
    local.get 2
    i32.store offset=4
    local.get 0
    local.get 3
    i32.store offset=8
    local.get 0
    local.get 4
    i32.store offset=12
    local.get 0
    local.get 5
    i32.store offset=16
    local.get 0
    local.get 6
    i32.store offset=20
    local.get 0
    local.get 7
    i32.store offset=24
    local.get 0)
  (func $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Value.fromAddress (type 0) (param i32) (result i32)
    (local i64)
    local.get 0
    i32.load offset=8
    i32.const 20
    i32.ne
    if  ;; label = @1
      i32.const 3664
      i32.const 3760
      i32.const 197
      i32.const 7
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0
    i64.extend_i32_u
    local.set 1
    i32.const 16
    i32.const 23
    call $~lib/rt/stub/__new
    local.tee 0
    i32.const 0
    i32.store
    local.get 0
    local.get 1
    i64.store offset=8
    local.get 0)
  (func $src/gno/createTransferEvent (type 10) (param i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i64)
    global.get $~lib/matchstick-as/defaults/defaultAddress
    local.set 6
    global.get $~lib/matchstick-as/defaults/defaultBigInt
    local.set 4
    global.get $~lib/matchstick-as/defaults/defaultBlock
    local.set 7
    global.get $~lib/matchstick-as/defaults/defaultTransaction
    local.set 8
    i32.const 0
    i32.const 0
    call $~lib/rt/stub/__new
    local.tee 5
    i32.const 3584
    i32.const 0
    call $~lib/memory/memory.copy
    i32.const 16
    i32.const 24
    call $~lib/rt/stub/__new
    local.tee 3
    local.get 5
    i32.store
    local.get 3
    local.get 5
    i32.store offset=4
    local.get 3
    i32.const 0
    i32.store offset=8
    local.get 3
    i32.const 0
    i32.store offset=12
    i32.const 0
    local.get 6
    local.get 4
    local.get 4
    i32.const 1744
    local.get 7
    local.get 8
    local.get 3
    call $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Event#constructor
    local.tee 3
    i32.load
    local.set 4
    local.get 3
    i32.load offset=4
    local.set 5
    local.get 3
    i32.load offset=8
    local.set 6
    local.get 3
    i32.load offset=12
    local.set 7
    local.get 3
    i32.load offset=16
    local.set 8
    local.get 3
    i32.load offset=20
    local.set 9
    local.get 3
    i32.load offset=24
    local.set 3
    i32.const 28
    i32.const 20
    call $~lib/rt/stub/__new
    local.get 4
    local.get 5
    local.get 6
    local.get 7
    local.get 8
    local.get 9
    local.get 3
    call $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Event#constructor
    local.tee 4
    local.set 6
    i32.const 16
    i32.const 24
    call $~lib/rt/stub/__new
    local.tee 3
    i32.const 0
    i32.store
    local.get 3
    i32.const 0
    i32.store offset=4
    local.get 3
    i32.const 0
    i32.store offset=8
    local.get 3
    i32.const 0
    i32.store offset=12
    i32.const 32
    i32.const 0
    call $~lib/rt/stub/__new
    local.tee 5
    i32.const 32
    call $~lib/memory/memory.fill
    local.get 3
    local.get 5
    i32.store
    local.get 3
    local.get 5
    i32.store offset=4
    local.get 3
    i32.const 32
    i32.store offset=8
    local.get 3
    i32.const 0
    i32.store offset=12
    local.get 6
    local.get 3
    i32.store offset=24
    i32.const 12345
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    i64.extend_i32_u
    local.set 10
    i32.const 16
    i32.const 23
    call $~lib/rt/stub/__new
    local.tee 3
    i32.const 3
    i32.store
    local.get 3
    local.get 10
    i64.store offset=8
    i32.const 8
    i32.const 22
    call $~lib/rt/stub/__new
    local.tee 5
    i32.const 2384
    i32.store
    local.get 5
    local.get 3
    i32.store offset=4
    local.get 0
    call $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Value.fromAddress
    local.set 3
    i32.const 8
    i32.const 22
    call $~lib/rt/stub/__new
    local.tee 0
    i32.const 3616
    i32.store
    local.get 0
    local.get 3
    i32.store offset=4
    local.get 1
    call $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Value.fromAddress
    local.set 3
    i32.const 8
    i32.const 22
    call $~lib/rt/stub/__new
    local.tee 1
    i32.const 3872
    i32.store
    local.get 1
    local.get 3
    i32.store offset=4
    local.get 2
    i64.extend_i32_u
    local.set 10
    i32.const 16
    i32.const 23
    call $~lib/rt/stub/__new
    local.tee 2
    i32.const 4
    i32.store
    local.get 2
    local.get 10
    i64.store offset=8
    i32.const 8
    i32.const 22
    call $~lib/rt/stub/__new
    local.tee 3
    i32.const 3920
    i32.store
    local.get 3
    local.get 2
    i32.store offset=4
    i32.const 16
    i32.const 23
    call $~lib/rt/stub/__new
    local.tee 2
    i32.const 6
    i32.store
    local.get 2
    i64.const 3552
    i64.store offset=8
    i32.const 8
    i32.const 22
    call $~lib/rt/stub/__new
    local.tee 6
    i32.const 3952
    i32.store
    local.get 6
    local.get 2
    i32.store offset=4
    local.get 4
    i32.load offset=24
    local.get 5
    call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#push
    local.get 4
    i32.load offset=24
    local.get 0
    call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#push
    local.get 4
    i32.load offset=24
    local.get 1
    call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#push
    local.get 4
    i32.load offset=24
    local.get 3
    call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#push
    local.get 4
    i32.load offset=24
    local.get 6
    call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#push
    local.get 4)
  (func $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Value#toAddress (type 0) (param i32) (result i32)
    local.get 0
    i32.load
    if  ;; label = @1
      i32.const 3984
      i32.const 3760
      i32.const 53
      i32.const 7
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0
    i64.load offset=8
    i32.wrap_i64)
  (func $generated/schema/User#set:voteWeight (type 3) (param i32 i32)
    (local i64)
    local.get 1
    i64.extend_i32_u
    local.set 2
    i32.const 16
    i32.const 5
    call $~lib/rt/stub/__new
    local.tee 1
    i32.const 7
    i32.store
    local.get 1
    local.get 2
    i64.store offset=8
    local.get 0
    i32.const 2544
    local.get 1
    call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set)
  (func $generated/schema/User#set:gno (type 3) (param i32 i32)
    (local i64)
    local.get 1
    i64.extend_i32_u
    local.set 2
    i32.const 16
    i32.const 5
    call $~lib/rt/stub/__new
    local.tee 1
    i32.const 7
    i32.store
    local.get 1
    local.get 2
    i64.store offset=8
    local.get 0
    i32.const 2592
    local.get 1
    call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set)
  (func $src/helpers/loadOrCreateUser (type 0) (param i32) (result i32)
    (local i32 i64)
    i32.const 3232
    local.get 0
    call $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.bytesToHex
    local.tee 1
    call $~lib/@graphprotocol/graph-ts/index/store.get
    local.tee 0
    i32.eqz
    if  ;; label = @1
      local.get 1
      call $generated/schema/User#constructor
      local.tee 0
      i32.const 0
      call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
      call $generated/schema/User#set:voteWeight
      local.get 0
      i32.const 0
      call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
      call $generated/schema/User#set:gno
      i32.const 0
      call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
      i64.extend_i32_u
      local.set 2
      i32.const 16
      i32.const 5
      call $~lib/rt/stub/__new
      local.tee 1
      i32.const 7
      i32.store
      local.get 1
      local.get 2
      i64.store offset=8
      local.get 0
      i32.const 2624
      local.get 1
      call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set
      i32.const 0
      call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
      i64.extend_i32_u
      local.set 2
      i32.const 16
      i32.const 5
      call $~lib/rt/stub/__new
      local.tee 1
      i32.const 7
      i32.store
      local.get 1
      local.get 2
      i64.store offset=8
      local.get 0
      i32.const 2656
      local.get 1
      call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set
      i32.const 0
      call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
      i64.extend_i32_u
      local.set 2
      i32.const 16
      i32.const 5
      call $~lib/rt/stub/__new
      local.tee 1
      i32.const 7
      i32.store
      local.get 1
      local.get 2
      i64.store offset=8
      local.get 0
      i32.const 2688
      local.get 1
      call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#set
    end
    local.get 0)
  (func $~lib/@graphprotocol/graph-ts/common/value/Value#toBigInt (type 0) (param i32) (result i32)
    local.get 0
    i32.load
    i32.const 7
    i32.ne
    if  ;; label = @1
      i32.const 4144
      i32.const 3328
      i32.const 64
      i32.const 5
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0
    i64.load offset=8
    i32.wrap_i64)
  (func $generated/schema/User#get:gno (type 0) (param i32) (result i32)
    local.get 0
    i32.const 2592
    call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#get
    local.tee 0
    i32.eqz
    if  ;; label = @1
      i32.const 4080
      i32.const 2880
      i32.const 63
      i32.const 12
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0
    call $~lib/@graphprotocol/graph-ts/common/value/Value#toBigInt)
  (func $generated/ds-gno/GNO/Transfer__Params#get:value (type 0) (param i32) (result i32)
    local.get 0
    i32.load
    i32.load offset=24
    i32.const 2
    call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#__get
    i32.load offset=4
    local.tee 0
    i32.load
    i32.const 3
    i32.eq
    if (result i32)  ;; label = @1
      i32.const 1
    else
      local.get 0
      i32.load
      i32.const 4
      i32.eq
    end
    i32.eqz
    if  ;; label = @1
      i32.const 4208
      i32.const 3760
      i32.const 80
      i32.const 7
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0
    i64.load offset=8
    i32.wrap_i64)
  (func $~lib/@graphprotocol/graph-ts/common/numbers/BigInt#minus (type 1) (param i32 i32) (result i32)
    local.get 0
    i32.eqz
    if  ;; label = @1
      i32.const 4304
      i32.const 4448
      i32.const 179
      i32.const 5
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0
    local.get 1
    call $~lib/@graphprotocol/graph-ts/common/numbers/bigInt.minus)
  (func $generated/schema/User#get:voteWeight (type 0) (param i32) (result i32)
    local.get 0
    i32.const 2544
    call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#get
    local.tee 0
    i32.eqz
    if  ;; label = @1
      i32.const 4080
      i32.const 2880
      i32.const 54
      i32.const 12
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0
    call $~lib/@graphprotocol/graph-ts/common/value/Value#toBigInt)
  (func $~lib/typedarray/Uint8Array#__get (type 1) (param i32 i32) (result i32)
    local.get 1
    local.get 0
    i32.load offset=8
    i32.ge_u
    if  ;; label = @1
      i32.const 1616
      i32.const 1680
      i32.const 164
      i32.const 45
      call $~lib/builtins/abort
      unreachable
    end
    local.get 1
    local.get 0
    i32.load offset=4
    i32.add
    i32.load8_u)
  (func $~lib/@graphprotocol/graph-ts/common/numbers/BigInt#plus (type 1) (param i32 i32) (result i32)
    local.get 0
    i32.eqz
    if  ;; label = @1
      i32.const 4560
      i32.const 4448
      i32.const 173
      i32.const 5
      call $~lib/builtins/abort
      unreachable
    end
    local.get 0
    local.get 1
    call $~lib/@graphprotocol/graph-ts/common/numbers/bigInt.plus)
  (func $src/gno/handleTransfer (type 5) (param i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32)
    i32.const 4
    i32.const 26
    call $~lib/rt/stub/__new
    local.tee 3
    i32.const 0
    i32.store
    local.get 3
    local.get 0
    i32.store
    local.get 3
    i32.load
    i32.load offset=24
    i32.const 1
    call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#__get
    i32.load offset=4
    call $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Value#toAddress
    local.set 8
    i32.const 4
    i32.const 26
    call $~lib/rt/stub/__new
    local.tee 3
    i32.const 0
    i32.store
    local.get 3
    local.get 0
    i32.store
    local.get 3
    i32.load
    i32.load offset=24
    i32.const 0
    call $~lib/array/Array<~lib/@graphprotocol/graph-ts/common/collections/TypedMapEntry<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>>#__get
    i32.load offset=4
    call $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Value#toAddress
    local.tee 3
    call $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.bytesToHex
    i32.const 1184
    call $~lib/string/String.__eq
    i32.eqz
    if  ;; label = @1
      local.get 3
      call $src/helpers/loadOrCreateUser
      local.tee 7
      call $generated/schema/User#get:gno
      local.set 1
      i32.const 4
      i32.const 26
      call $~lib/rt/stub/__new
      local.tee 3
      i32.const 0
      i32.store
      local.get 3
      local.get 0
      i32.store
      local.get 7
      local.get 1
      local.get 3
      call $generated/ds-gno/GNO/Transfer__Params#get:value
      call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt#minus
      call $generated/schema/User#set:gno
      local.get 7
      call $generated/schema/User#get:voteWeight
      local.set 1
      i32.const 4
      i32.const 26
      call $~lib/rt/stub/__new
      local.tee 3
      i32.const 0
      i32.store
      local.get 3
      local.get 0
      i32.store
      local.get 7
      local.get 1
      local.get 3
      call $generated/ds-gno/GNO/Transfer__Params#get:value
      call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt#minus
      call $generated/schema/User#set:voteWeight
      block (result i32)  ;; label = @2
        local.get 7
        call $generated/schema/User#get:voteWeight
        local.set 5
        i32.const 0
        call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
        local.set 6
        local.get 5
        i32.load offset=8
        i32.const 0
        i32.gt_s
        local.tee 1
        if (result i32)  ;; label = @3
          local.get 5
          local.get 5
          i32.load offset=8
          i32.const 1
          i32.sub
          call $~lib/typedarray/Uint8Array#__get
          i32.const 7
          i32.shr_u
          i32.const 1
          i32.eq
        else
          local.get 1
        end
        local.set 2
        i32.const 1
        i32.const 0
        block (result i32)  ;; label = @3
          local.get 6
          i32.load offset=8
          i32.const 0
          i32.gt_s
          local.tee 1
          if  ;; label = @4
            local.get 6
            local.get 6
            i32.load offset=8
            i32.const 1
            i32.sub
            call $~lib/typedarray/Uint8Array#__get
            i32.const 7
            i32.shr_u
            i32.const 1
            i32.eq
            local.set 1
          end
          local.get 1
        end
        local.get 2
        select
        br_if 0 (;@2;)
        drop
        i32.const -1
        local.get 1
        i32.const 1
        local.get 2
        select
        i32.eqz
        br_if 0 (;@2;)
        drop
        local.get 5
        i32.load offset=8
        local.set 4
        loop  ;; label = @3
          local.get 4
          i32.const 0
          i32.gt_s
          if (result i32)  ;; label = @4
            local.get 2
            if (result i32)  ;; label = @5
              i32.const 1
            else
              local.get 5
              local.get 4
              i32.const 1
              i32.sub
              call $~lib/typedarray/Uint8Array#__get
            end
            if (result i32)  ;; label = @5
              local.get 2
              if (result i32)  ;; label = @6
                local.get 5
                local.get 4
                i32.const 1
                i32.sub
                call $~lib/typedarray/Uint8Array#__get
                i32.const 255
                i32.eq
              else
                i32.const 0
              end
            else
              i32.const 1
            end
          else
            i32.const 0
          end
          if  ;; label = @4
            local.get 4
            i32.const 1
            i32.sub
            local.set 4
            br 1 (;@3;)
          end
        end
        local.get 6
        i32.load offset=8
        local.set 3
        loop  ;; label = @3
          local.get 3
          i32.const 0
          i32.gt_s
          if (result i32)  ;; label = @4
            local.get 1
            if (result i32)  ;; label = @5
              i32.const 1
            else
              local.get 6
              local.get 3
              i32.const 1
              i32.sub
              call $~lib/typedarray/Uint8Array#__get
            end
            if (result i32)  ;; label = @5
              local.get 1
              if (result i32)  ;; label = @6
                local.get 6
                local.get 3
                i32.const 1
                i32.sub
                call $~lib/typedarray/Uint8Array#__get
                i32.const 255
                i32.eq
              else
                i32.const 0
              end
            else
              i32.const 1
            end
          else
            i32.const 0
          end
          if  ;; label = @4
            local.get 3
            i32.const 1
            i32.sub
            local.set 3
            br 1 (;@3;)
          end
        end
        i32.const -1
        i32.const 1
        local.get 2
        select
        local.get 3
        local.get 4
        i32.lt_s
        br_if 0 (;@2;)
        drop
        i32.const 1
        i32.const -1
        local.get 2
        select
        local.get 3
        local.get 4
        i32.gt_s
        br_if 0 (;@2;)
        drop
        i32.const 1
        local.set 1
        loop  ;; label = @3
          local.get 1
          local.get 4
          i32.le_s
          if  ;; label = @4
            i32.const -1
            local.get 5
            local.get 4
            local.get 1
            i32.sub
            local.tee 3
            call $~lib/typedarray/Uint8Array#__get
            local.get 6
            local.get 3
            call $~lib/typedarray/Uint8Array#__get
            i32.lt_u
            br_if 2 (;@2;)
            drop
            i32.const 1
            local.get 5
            local.get 4
            local.get 1
            i32.sub
            local.tee 3
            call $~lib/typedarray/Uint8Array#__get
            local.get 6
            local.get 3
            call $~lib/typedarray/Uint8Array#__get
            i32.gt_u
            br_if 2 (;@2;)
            drop
            local.get 1
            i32.const 1
            i32.add
            local.set 1
            br 1 (;@3;)
          end
        end
        i32.const 0
      end
      if  ;; label = @2
        local.get 7
        call $generated/schema/User#save
      else
        local.get 7
        i32.const 2384
        call $~lib/@graphprotocol/graph-ts/common/collections/TypedMap<~lib/string/String_~lib/@graphprotocol/graph-ts/common/value/Value>#get
        local.tee 3
        i32.eqz
        if  ;; label = @3
          i32.const 4080
          i32.const 2880
          i32.const 45
          i32.const 12
          call $~lib/builtins/abort
          unreachable
        end
        i32.const 3232
        local.get 3
        call $~lib/@graphprotocol/graph-ts/common/value/Value#toString
        call $~lib/@graphprotocol/graph-ts/index/store.remove
      end
    end
    local.get 8
    call $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.bytesToHex
    i32.const 1184
    call $~lib/string/String.__eq
    i32.eqz
    if  ;; label = @1
      local.get 8
      call $src/helpers/loadOrCreateUser
      local.tee 3
      call $generated/schema/User#get:gno
      local.set 2
      i32.const 4
      i32.const 26
      call $~lib/rt/stub/__new
      local.tee 1
      i32.const 0
      i32.store
      local.get 1
      local.get 0
      i32.store
      local.get 3
      local.get 2
      local.get 1
      call $generated/ds-gno/GNO/Transfer__Params#get:value
      call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt#plus
      call $generated/schema/User#set:gno
      local.get 3
      call $generated/schema/User#get:voteWeight
      local.set 2
      i32.const 4
      i32.const 26
      call $~lib/rt/stub/__new
      local.tee 1
      i32.const 0
      i32.store
      local.get 1
      local.get 0
      i32.store
      local.get 3
      local.get 2
      local.get 1
      call $generated/ds-gno/GNO/Transfer__Params#get:value
      call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt#plus
      call $generated/schema/User#set:voteWeight
      local.get 3
      call $generated/schema/User#save
    end)
  (func $tests/gno.test/runTests~anonymous|0 (type 4)
    (local i32 i32)
    i32.const 2736
    call $generated/schema/User#constructor
    call $generated/schema/User#save
    i32.const 1337
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    local.set 0
    i32.const 3440
    call $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.stringToH160
    local.set 1
    i32.const 3440
    call $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.stringToH160
    local.get 1
    local.get 0
    call $src/gno/createTransferEvent
    call $src/gno/handleTransfer
    i32.const 3232
    i32.const 2736
    i32.const 2384
    i32.const 4688
    call $~lib/matchstick-as/assembly/assert/_assert.fieldEquals
    i32.eqz
    if  ;; label = @1
      i32.const 4720
      i32.const 4784
      i32.const 13
      i32.const 7
      call $~lib/builtins/abort
      unreachable
    end
    call $~lib/matchstick-as/assembly/store/clearStore)
  (func $tests/gno.test/runTests (type 4)
    i32.const 2288
    i32.const 0
    i32.const 4880
    i32.load
    call $~lib/matchstick-as/assembly/index/_registerTest)
  (func $node_modules/@graphprotocol/graph-ts/global/global/id_of_type (type 0) (param i32) (result i32)
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      block  ;; label = @10
                        block  ;; label = @11
                          block  ;; label = @12
                            block  ;; label = @13
                              block  ;; label = @14
                                block  ;; label = @15
                                  block  ;; label = @16
                                    block  ;; label = @17
                                      block  ;; label = @18
                                        block  ;; label = @19
                                          block  ;; label = @20
                                            block  ;; label = @21
                                              block  ;; label = @22
                                                block  ;; label = @23
                                                  block  ;; label = @24
                                                    block  ;; label = @25
                                                      block  ;; label = @26
                                                        block  ;; label = @27
                                                          block  ;; label = @28
                                                            block  ;; label = @29
                                                              block  ;; label = @30
                                                                block  ;; label = @31
                                                                  block  ;; label = @32
                                                                    block  ;; label = @33
                                                                      block  ;; label = @34
                                                                        block  ;; label = @35
                                                                          block  ;; label = @36
                                                                            block  ;; label = @37
                                                                              block  ;; label = @38
                                                                                block  ;; label = @39
                                                                                  block  ;; label = @40
                                                                                    block  ;; label = @41
                                                                                      block  ;; label = @42
                                                                                        block  ;; label = @43
                                                                                          block  ;; label = @44
                                                                                            block  ;; label = @45
                                                                                              block  ;; label = @46
                                                                                                block  ;; label = @47
                                                                                                  block  ;; label = @48
                                                                                                    block  ;; label = @49
                                                                                                      block  ;; label = @50
                                                                                                        block  ;; label = @51
                                                                                                          block  ;; label = @52
                                                                                                            block  ;; label = @53
                                                                                                              block  ;; label = @54
                                                                                                                block  ;; label = @55
                                                                                                                  block  ;; label = @56
                                                                                                                    block  ;; label = @57
                                                                                                                      block  ;; label = @58
                                                                                                                        block  ;; label = @59
                                                                                                                          block  ;; label = @60
                                                                                                                            block  ;; label = @61
                                                                                                                              block  ;; label = @62
                                                                                                                                block  ;; label = @63
                                                                                                                                  block  ;; label = @64
                                                                                                                                    block  ;; label = @65
                                                                                                                                      block  ;; label = @66
                                                                                                                                        block  ;; label = @67
                                                                                                                                          block  ;; label = @68
                                                                                                                                            block  ;; label = @69
                                                                                                                                              block  ;; label = @70
                                                                                                                                                block  ;; label = @71
                                                                                                                                                  block  ;; label = @72
                                                                                                                                                    block  ;; label = @73
                                                                                                                                                      block  ;; label = @74
                                                                                                                                                        block  ;; label = @75
                                                                                                                                                          block  ;; label = @76
                                                                                                                                                            block  ;; label = @77
                                                                                                                                                              block  ;; label = @78
                                                                                                                                                                block  ;; label = @79
                                                                                                                                                                  block  ;; label = @80
                                                                                                                                                                    block  ;; label = @81
                                                                                                                                                                      block  ;; label = @82
                                                                                                                                                                        block  ;; label = @83
                                                                                                                                                                          block  ;; label = @84
                                                                                                                                                                            block  ;; label = @85
                                                                                                                                                                              block  ;; label = @86
                                                                                                                                                                                block  ;; label = @87
                                                                                                                                                                                  local.get 0
                                                                                                                                                                                  br_table 0 (;@87;) 1 (;@86;) 2 (;@85;) 3 (;@84;) 4 (;@83;) 5 (;@82;) 6 (;@81;) 7 (;@80;) 8 (;@79;) 9 (;@78;) 10 (;@77;) 11 (;@76;) 12 (;@75;) 13 (;@74;) 14 (;@73;) 15 (;@72;) 16 (;@71;) 17 (;@70;) 18 (;@69;) 19 (;@68;) 20 (;@67;) 21 (;@66;) 25 (;@62;) 26 (;@61;) 27 (;@60;) 28 (;@59;) 29 (;@58;) 22 (;@65;) 23 (;@64;) 24 (;@63;) 30 (;@57;) 31 (;@56;) 32 (;@55;) 33 (;@54;) 34 (;@53;) 35 (;@52;) 36 (;@51;) 37 (;@50;) 38 (;@49;) 39 (;@48;) 40 (;@47;) 41 (;@46;) 42 (;@45;) 43 (;@44;) 44 (;@43;) 45 (;@42;) 46 (;@41;) 47 (;@40;) 48 (;@39;) 49 (;@38;) 50 (;@37;) 51 (;@36;) 52 (;@35;) 53 (;@34;) 54 (;@33;) 55 (;@32;) 56 (;@31;) 57 (;@30;) 58 (;@29;) 59 (;@28;) 60 (;@27;) 61 (;@26;) 86 (;@1;) 62 (;@25;) 63 (;@24;) 64 (;@23;) 65 (;@22;) 66 (;@21;) 67 (;@20;) 68 (;@19;) 69 (;@18;) 70 (;@17;) 71 (;@16;) 72 (;@15;) 73 (;@14;) 74 (;@13;) 75 (;@12;) 76 (;@11;) 77 (;@10;) 78 (;@9;) 79 (;@8;) 80 (;@7;) 81 (;@6;) 82 (;@5;) 83 (;@4;) 84 (;@3;) 85 (;@2;) 86 (;@1;)
                                                                                                                                                                                end
                                                                                                                                                                                i32.const 1
                                                                                                                                                                                return
                                                                                                                                                                              end
                                                                                                                                                                              i32.const 0
                                                                                                                                                                              return
                                                                                                                                                                            end
                                                                                                                                                                            i32.const 28
                                                                                                                                                                            return
                                                                                                                                                                          end
                                                                                                                                                                          i32.const 29
                                                                                                                                                                          return
                                                                                                                                                                        end
                                                                                                                                                                        i32.const 30
                                                                                                                                                                        return
                                                                                                                                                                      end
                                                                                                                                                                      i32.const 31
                                                                                                                                                                      return
                                                                                                                                                                    end
                                                                                                                                                                    i32.const 12
                                                                                                                                                                    return
                                                                                                                                                                  end
                                                                                                                                                                  i32.const 32
                                                                                                                                                                  return
                                                                                                                                                                end
                                                                                                                                                                i32.const 33
                                                                                                                                                                return
                                                                                                                                                              end
                                                                                                                                                              i32.const 34
                                                                                                                                                              return
                                                                                                                                                            end
                                                                                                                                                            i32.const 35
                                                                                                                                                            return
                                                                                                                                                          end
                                                                                                                                                          i32.const 36
                                                                                                                                                          return
                                                                                                                                                        end
                                                                                                                                                        i32.const 37
                                                                                                                                                        return
                                                                                                                                                      end
                                                                                                                                                      i32.const 39
                                                                                                                                                      return
                                                                                                                                                    end
                                                                                                                                                    i32.const 40
                                                                                                                                                    return
                                                                                                                                                  end
                                                                                                                                                  i32.const 42
                                                                                                                                                  return
                                                                                                                                                end
                                                                                                                                                i32.const 44
                                                                                                                                                return
                                                                                                                                              end
                                                                                                                                              i32.const 46
                                                                                                                                              return
                                                                                                                                            end
                                                                                                                                            i32.const 47
                                                                                                                                            return
                                                                                                                                          end
                                                                                                                                          i32.const 49
                                                                                                                                          return
                                                                                                                                        end
                                                                                                                                        i32.const 51
                                                                                                                                        return
                                                                                                                                      end
                                                                                                                                      i32.const 56
                                                                                                                                      return
                                                                                                                                    end
                                                                                                                                    i32.const 57
                                                                                                                                    return
                                                                                                                                  end
                                                                                                                                  i32.const 58
                                                                                                                                  return
                                                                                                                                end
                                                                                                                                i32.const 59
                                                                                                                                return
                                                                                                                              end
                                                                                                                              i32.const 60
                                                                                                                              return
                                                                                                                            end
                                                                                                                            i32.const 48
                                                                                                                            return
                                                                                                                          end
                                                                                                                          i32.const 64
                                                                                                                          return
                                                                                                                        end
                                                                                                                        i32.const 65
                                                                                                                        return
                                                                                                                      end
                                                                                                                      i32.const 66
                                                                                                                      return
                                                                                                                    end
                                                                                                                    i32.const 41
                                                                                                                    return
                                                                                                                  end
                                                                                                                  i32.const 43
                                                                                                                  return
                                                                                                                end
                                                                                                                i32.const 45
                                                                                                                return
                                                                                                              end
                                                                                                              i32.const 67
                                                                                                              return
                                                                                                            end
                                                                                                            i32.const 52
                                                                                                            return
                                                                                                          end
                                                                                                          i32.const 68
                                                                                                          return
                                                                                                        end
                                                                                                        i32.const 53
                                                                                                        return
                                                                                                      end
                                                                                                      i32.const 68
                                                                                                      return
                                                                                                    end
                                                                                                    i32.const 69
                                                                                                    return
                                                                                                  end
                                                                                                  i32.const 72
                                                                                                  return
                                                                                                end
                                                                                                i32.const 74
                                                                                                return
                                                                                              end
                                                                                              i32.const 75
                                                                                              return
                                                                                            end
                                                                                            i32.const 76
                                                                                            return
                                                                                          end
                                                                                          i32.const 77
                                                                                          return
                                                                                        end
                                                                                        i32.const 78
                                                                                        return
                                                                                      end
                                                                                      i32.const 79
                                                                                      return
                                                                                    end
                                                                                    i32.const 80
                                                                                    return
                                                                                  end
                                                                                  i32.const 25
                                                                                  return
                                                                                end
                                                                                i32.const 81
                                                                                return
                                                                              end
                                                                              i32.const 82
                                                                              return
                                                                            end
                                                                            i32.const 83
                                                                            return
                                                                          end
                                                                          i32.const 84
                                                                          return
                                                                        end
                                                                        i32.const 86
                                                                        return
                                                                      end
                                                                      i32.const 87
                                                                      return
                                                                    end
                                                                    i32.const 89
                                                                    return
                                                                  end
                                                                  i32.const 90
                                                                  return
                                                                end
                                                                i32.const 95
                                                                return
                                                              end
                                                              i32.const 97
                                                              return
                                                            end
                                                            i32.const 99
                                                            return
                                                          end
                                                          i32.const 101
                                                          return
                                                        end
                                                        i32.const 102
                                                        return
                                                      end
                                                      i32.const 88
                                                      return
                                                    end
                                                    i32.const 94
                                                    return
                                                  end
                                                  i32.const 98
                                                  return
                                                end
                                                i32.const 103
                                                return
                                              end
                                              i32.const 104
                                              return
                                            end
                                            i32.const 102
                                            return
                                          end
                                          i32.const 85
                                          return
                                        end
                                        i32.const 105
                                        return
                                      end
                                      i32.const 106
                                      return
                                    end
                                    i32.const 107
                                    return
                                  end
                                  i32.const 108
                                  return
                                end
                                i32.const 109
                                return
                              end
                              i32.const 110
                              return
                            end
                            i32.const 112
                            return
                          end
                          i32.const 113
                          return
                        end
                        i32.const 114
                        return
                      end
                      i32.const 115
                      return
                    end
                    i32.const 91
                    return
                  end
                  i32.const 116
                  return
                end
                i32.const 96
                return
              end
              i32.const 117
              return
            end
            i32.const 93
            return
          end
          i32.const 100
          return
        end
        i32.const 118
        return
      end
      i32.const 119
      return
    end
    i32.const 0)
  (func $node_modules/@graphprotocol/graph-ts/global/global/allocate (type 0) (param i32) (result i32)
    local.get 0
    call $~lib/rt/stub/__alloc)
  (func $~start (type 4)
    (local i32 i32 i32)
    global.get $~started
    if  ;; label = @1
      return
    end
    i32.const 1
    global.set $~started
    i32.const 4892
    global.set $~lib/rt/stub/offset
    i32.const 0
    call $~lib/rt/stub/__alloc
    drop
    i32.const 4
    i32.const 3
    call $~lib/rt/stub/__new
    call $~lib/@graphprotocol/graph-ts/common/collections/Entity#constructor
    drop
    i32.const 1440
    call $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.stringToH160
    global.set $~lib/matchstick-as/assembly/defaults/defaultAddress
    i32.const 1440
    call $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.stringToH160
    global.set $~lib/matchstick-as/assembly/defaults/defaultAddressBytes
    i32.const 1
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    global.set $~lib/matchstick-as/assembly/defaults/defaultBigInt
    global.get $~lib/matchstick-as/assembly/defaults/defaultAddressBytes
    local.tee 0
    local.get 0
    local.get 0
    global.get $~lib/matchstick-as/assembly/defaults/defaultAddress
    local.get 0
    local.get 0
    local.get 0
    global.get $~lib/matchstick-as/assembly/defaults/defaultBigInt
    local.tee 0
    local.get 0
    local.get 0
    local.get 0
    local.get 0
    local.get 0
    local.get 0
    local.get 0
    call $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Block#constructor
    drop
    global.get $~lib/matchstick-as/assembly/defaults/defaultAddressBytes
    local.tee 1
    global.get $~lib/matchstick-as/assembly/defaults/defaultBigInt
    local.tee 0
    global.get $~lib/matchstick-as/assembly/defaults/defaultAddress
    local.tee 2
    local.get 2
    local.get 0
    local.get 0
    local.get 0
    local.get 1
    local.get 0
    call $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Transaction#constructor
    drop
    i32.const 4
    i32.const 3
    call $~lib/rt/stub/__new
    call $~lib/@graphprotocol/graph-ts/common/collections/Entity#constructor
    drop
    i32.const 1440
    call $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.stringToH160
    global.set $~lib/matchstick-as/defaults/defaultAddress
    i32.const 1440
    call $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.stringToH160
    global.set $~lib/matchstick-as/defaults/defaultAddressBytes
    i32.const 1
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    global.set $~lib/matchstick-as/defaults/defaultBigInt
    global.get $~lib/matchstick-as/defaults/defaultAddressBytes
    local.tee 0
    local.get 0
    local.get 0
    global.get $~lib/matchstick-as/defaults/defaultAddress
    local.get 0
    local.get 0
    local.get 0
    global.get $~lib/matchstick-as/defaults/defaultBigInt
    local.tee 0
    local.get 0
    local.get 0
    local.get 0
    local.get 0
    local.get 0
    local.get 0
    local.get 0
    call $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Block#constructor
    global.set $~lib/matchstick-as/defaults/defaultBlock
    global.get $~lib/matchstick-as/defaults/defaultAddressBytes
    local.tee 1
    global.get $~lib/matchstick-as/defaults/defaultBigInt
    local.tee 0
    global.get $~lib/matchstick-as/defaults/defaultAddress
    local.tee 2
    local.get 2
    local.get 0
    local.get 0
    local.get 0
    local.get 1
    local.get 0
    call $~lib/@graphprotocol/graph-ts/chain/ethereum/ethereum.Transaction#constructor
    global.set $~lib/matchstick-as/defaults/defaultTransaction
    i32.const 2080
    call $~lib/@graphprotocol/graph-ts/common/conversion/typeConversion.stringToH160
    global.set $src/helpers/GNO_ADDRESS
    global.get $src/helpers/GNO_ADDRESS
    local.set 1
    block (result i32)  ;; label = @1
      i32.const 8
      i32.const 16
      call $~lib/rt/stub/__new
      local.tee 0
      i32.eqz
      if  ;; label = @2
        i32.const 8
        i32.const 17
        call $~lib/rt/stub/__new
        local.set 0
      end
      local.get 0
    end
    i32.const 0
    i32.store
    local.get 0
    i32.const 0
    i32.store offset=4
    local.get 0
    i32.const 2192
    i32.store
    local.get 0
    local.get 1
    i32.store offset=4
    i32.const 0
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    drop
    i32.const 1
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    drop
    i32.const 2224
    call $~lib/@graphprotocol/graph-ts/common/numbers/bigDecimal.fromString
    drop
    i32.const 2256
    call $~lib/@graphprotocol/graph-ts/common/numbers/bigDecimal.fromString
    drop
    i32.const 18
    call $~lib/@graphprotocol/graph-ts/common/numbers/BigInt.fromI32
    drop
    i32.const 0
    call $~lib/rt/stub/__alloc
    drop)
  (table $0 2 funcref)
  (memory (;0;) 1)
  (global $~lib/rt/stub/offset (mut i32) (i32.const 0))
  (global $~lib/matchstick-as/assembly/defaults/defaultAddress (mut i32) (i32.const 0))
  (global $~lib/matchstick-as/assembly/defaults/defaultAddressBytes (mut i32) (i32.const 0))
  (global $~lib/matchstick-as/assembly/defaults/defaultBigInt (mut i32) (i32.const 0))
  (global $~lib/matchstick-as/defaults/defaultAddress (mut i32) (i32.const 0))
  (global $~lib/matchstick-as/defaults/defaultAddressBytes (mut i32) (i32.const 0))
  (global $~lib/matchstick-as/defaults/defaultBigInt (mut i32) (i32.const 0))
  (global $~lib/matchstick-as/defaults/defaultBlock (mut i32) (i32.const 0))
  (global $~lib/matchstick-as/defaults/defaultTransaction (mut i32) (i32.const 0))
  (global $src/helpers/GNO_ADDRESS (mut i32) (i32.const 0))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.String i32 (i32.const 0))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayBuffer i32 (i32.const 1))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.Int8Array i32 (i32.const 2))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.Int16Array i32 (i32.const 3))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.Int32Array i32 (i32.const 4))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.Int64Array i32 (i32.const 5))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.Uint8Array i32 (i32.const 6))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.Uint16Array i32 (i32.const 7))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.Uint32Array i32 (i32.const 8))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.Uint64Array i32 (i32.const 9))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.Float32Array i32 (i32.const 10))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.Float64Array i32 (i32.const 11))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.BigDecimal i32 (i32.const 12))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayBool i32 (i32.const 13))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayUint8Array i32 (i32.const 14))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayEthereumValue i32 (i32.const 15))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayStoreValue i32 (i32.const 16))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayJsonValue i32 (i32.const 17))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayString i32 (i32.const 18))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayEventParam i32 (i32.const 19))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayTypedMapEntryStringJsonValue i32 (i32.const 20))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayTypedMapEntryStringStoreValue i32 (i32.const 21))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.SmartContractCall i32 (i32.const 22))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.EventParam i32 (i32.const 23))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.EthereumTransaction i32 (i32.const 24))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.EthereumBlock i32 (i32.const 25))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.EthereumCall i32 (i32.const 26))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.WrappedTypedMapStringJsonValue i32 (i32.const 27))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.WrappedBool i32 (i32.const 28))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.WrappedJsonValue i32 (i32.const 29))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.EthereumValue i32 (i32.const 30))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.StoreValue i32 (i32.const 31))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.JsonValue i32 (i32.const 32))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.EthereumEvent i32 (i32.const 33))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.TypedMapEntryStringStoreValue i32 (i32.const 34))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.TypedMapEntryStringJsonValue i32 (i32.const 35))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.TypedMapStringStoreValue i32 (i32.const 36))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.TypedMapStringJsonValue i32 (i32.const 37))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.TypedMapStringTypedMapStringJsonValue i32 (i32.const 38))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ResultTypedMapStringJsonValueBool i32 (i32.const 39))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ResultJsonValueBool i32 (i32.const 40))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayU8 i32 (i32.const 41))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayU16 i32 (i32.const 42))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayU32 i32 (i32.const 43))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayU64 i32 (i32.const 44))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayI8 i32 (i32.const 45))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayI16 i32 (i32.const 46))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayI32 i32 (i32.const 47))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayI64 i32 (i32.const 48))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayF32 i32 (i32.const 49))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayF64 i32 (i32.const 50))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.ArrayBigDecimal i32 (i32.const 51))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearArrayDataReceiver i32 (i32.const 52))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearArrayCryptoHash i32 (i32.const 53))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearArrayActionValue i32 (i32.const 54))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearMerklePath i32 (i32.const 55))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearArrayValidatorStake i32 (i32.const 56))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearArraySlashedValidator i32 (i32.const 57))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearArraySignature i32 (i32.const 58))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearArrayChunkHeader i32 (i32.const 59))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearAccessKeyPermissionValue i32 (i32.const 60))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearActionValue i32 (i32.const 61))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearDirection i32 (i32.const 62))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearPublicKey i32 (i32.const 63))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearSignature i32 (i32.const 64))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearFunctionCallPermission i32 (i32.const 65))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearFullAccessPermission i32 (i32.const 66))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearAccessKey i32 (i32.const 67))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearDataReceiver i32 (i32.const 68))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearCreateAccountAction i32 (i32.const 69))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearDeployContractAction i32 (i32.const 70))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearFunctionCallAction i32 (i32.const 71))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearTransferAction i32 (i32.const 72))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearStakeAction i32 (i32.const 73))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearAddKeyAction i32 (i32.const 74))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearDeleteKeyAction i32 (i32.const 75))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearDeleteAccountAction i32 (i32.const 76))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearActionReceipt i32 (i32.const 77))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearSuccessStatus i32 (i32.const 78))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearMerklePathItem i32 (i32.const 79))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearExecutionOutcome i32 (i32.const 80))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearSlashedValidator i32 (i32.const 81))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearBlockHeader i32 (i32.const 82))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearValidatorStake i32 (i32.const 83))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearChunkHeader i32 (i32.const 84))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearBlock i32 (i32.const 85))
  (global $node_modules/@graphprotocol/graph-ts/global/global/TypeId.NearReceiptWithOutcome i32 (i32.const 86))
  (global $~started (mut i32) (i32.const 0))
  (export "runTests" (func $tests/gno.test/runTests))
  (export "TypeId.String" (global 10))
  (export "TypeId.ArrayBuffer" (global 11))
  (export "TypeId.Int8Array" (global 12))
  (export "TypeId.Int16Array" (global 13))
  (export "TypeId.Int32Array" (global 14))
  (export "TypeId.Int64Array" (global 15))
  (export "TypeId.Uint8Array" (global 16))
  (export "TypeId.Uint16Array" (global 17))
  (export "TypeId.Uint32Array" (global 18))
  (export "TypeId.Uint64Array" (global 19))
  (export "TypeId.Float32Array" (global 20))
  (export "TypeId.Float64Array" (global 21))
  (export "TypeId.BigDecimal" (global 22))
  (export "TypeId.ArrayBool" (global 23))
  (export "TypeId.ArrayUint8Array" (global 24))
  (export "TypeId.ArrayEthereumValue" (global 25))
  (export "TypeId.ArrayStoreValue" (global 26))
  (export "TypeId.ArrayJsonValue" (global 27))
  (export "TypeId.ArrayString" (global 28))
  (export "TypeId.ArrayEventParam" (global 29))
  (export "TypeId.ArrayTypedMapEntryStringJsonValue" (global 30))
  (export "TypeId.ArrayTypedMapEntryStringStoreValue" (global 31))
  (export "TypeId.SmartContractCall" (global 32))
  (export "TypeId.EventParam" (global 33))
  (export "TypeId.EthereumTransaction" (global 34))
  (export "TypeId.EthereumBlock" (global 35))
  (export "TypeId.EthereumCall" (global 36))
  (export "TypeId.WrappedTypedMapStringJsonValue" (global 37))
  (export "TypeId.WrappedBool" (global 38))
  (export "TypeId.WrappedJsonValue" (global 39))
  (export "TypeId.EthereumValue" (global 40))
  (export "TypeId.StoreValue" (global 41))
  (export "TypeId.JsonValue" (global 42))
  (export "TypeId.EthereumEvent" (global 43))
  (export "TypeId.TypedMapEntryStringStoreValue" (global 44))
  (export "TypeId.TypedMapEntryStringJsonValue" (global 45))
  (export "TypeId.TypedMapStringStoreValue" (global 46))
  (export "TypeId.TypedMapStringJsonValue" (global 47))
  (export "TypeId.TypedMapStringTypedMapStringJsonValue" (global 48))
  (export "TypeId.ResultTypedMapStringJsonValueBool" (global 49))
  (export "TypeId.ResultJsonValueBool" (global 50))
  (export "TypeId.ArrayU8" (global 51))
  (export "TypeId.ArrayU16" (global 52))
  (export "TypeId.ArrayU32" (global 53))
  (export "TypeId.ArrayU64" (global 54))
  (export "TypeId.ArrayI8" (global 55))
  (export "TypeId.ArrayI16" (global 56))
  (export "TypeId.ArrayI32" (global 57))
  (export "TypeId.ArrayI64" (global 58))
  (export "TypeId.ArrayF32" (global 59))
  (export "TypeId.ArrayF64" (global 60))
  (export "TypeId.ArrayBigDecimal" (global 61))
  (export "TypeId.NearArrayDataReceiver" (global 62))
  (export "TypeId.NearArrayCryptoHash" (global 63))
  (export "TypeId.NearArrayActionValue" (global 64))
  (export "TypeId.NearMerklePath" (global 65))
  (export "TypeId.NearArrayValidatorStake" (global 66))
  (export "TypeId.NearArraySlashedValidator" (global 67))
  (export "TypeId.NearArraySignature" (global 68))
  (export "TypeId.NearArrayChunkHeader" (global 69))
  (export "TypeId.NearAccessKeyPermissionValue" (global 70))
  (export "TypeId.NearActionValue" (global 71))
  (export "TypeId.NearDirection" (global 72))
  (export "TypeId.NearPublicKey" (global 73))
  (export "TypeId.NearSignature" (global 74))
  (export "TypeId.NearFunctionCallPermission" (global 75))
  (export "TypeId.NearFullAccessPermission" (global 76))
  (export "TypeId.NearAccessKey" (global 77))
  (export "TypeId.NearDataReceiver" (global 78))
  (export "TypeId.NearCreateAccountAction" (global 79))
  (export "TypeId.NearDeployContractAction" (global 80))
  (export "TypeId.NearFunctionCallAction" (global 81))
  (export "TypeId.NearTransferAction" (global 82))
  (export "TypeId.NearStakeAction" (global 83))
  (export "TypeId.NearAddKeyAction" (global 84))
  (export "TypeId.NearDeleteKeyAction" (global 85))
  (export "TypeId.NearDeleteAccountAction" (global 86))
  (export "TypeId.NearActionReceipt" (global 87))
  (export "TypeId.NearSuccessStatus" (global 88))
  (export "TypeId.NearMerklePathItem" (global 89))
  (export "TypeId.NearExecutionOutcome" (global 90))
  (export "TypeId.NearSlashedValidator" (global 91))
  (export "TypeId.NearBlockHeader" (global 92))
  (export "TypeId.NearValidatorStake" (global 93))
  (export "TypeId.NearChunkHeader" (global 94))
  (export "TypeId.NearBlock" (global 95))
  (export "TypeId.NearReceiptWithOutcome" (global 96))
  (export "id_of_type" (func $node_modules/@graphprotocol/graph-ts/global/global/id_of_type))
  (export "allocate" (func $node_modules/@graphprotocol/graph-ts/global/global/allocate))
  (export "memory" (memory 0))
  (export "table" (table 0))
  (export "_start" (func $~start))
  (elem $0 (i32.const 1) func $tests/gno.test/runTests~anonymous|0)
  (data (;0;) (i32.const 1036) "<")
  (data (;1;) (i32.const 1048) "\01\00\00\00(\00\00\00A\00l\00l\00o\00c\00a\00t\00i\00o\00n\00 \00t\00o\00o\00 \00l\00a\00r\00g\00e")
  (data (;2;) (i32.const 1100) "<")
  (data (;3;) (i32.const 1112) "\01\00\00\00\1e\00\00\00~\00l\00i\00b\00/\00r\00t\00/\00s\00t\00u\00b\00.\00t\00s")
  (data (;4;) (i32.const 1164) "l")
  (data (;5;) (i32.const 1176) "\01\00\00\00T\00\00\000\00x\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000")
  (data (;6;) (i32.const 1276) ",")
  (data (;7;) (i32.const 1288) "\01\00\00\00\0e\00\00\00m\00a\00i\00n\00n\00e\00t")
  (data (;8;) (i32.const 1324) ",")
  (data (;9;) (i32.const 1336) "\01\00\00\00\1c\00\00\00I\00n\00v\00a\00l\00i\00d\00 \00l\00e\00n\00g\00t\00h")
  (data (;10;) (i32.const 1372) ",")
  (data (;11;) (i32.const 1384) "\01\00\00\00\1a\00\00\00~\00l\00i\00b\00/\00a\00r\00r\00a\00y\00.\00t\00s")
  (data (;12;) (i32.const 1420) "l")
  (data (;13;) (i32.const 1432) "\01\00\00\00T\00\00\000\00x\00A\001\006\000\008\001\00F\003\006\000\00e\003\008\004\007\000\000\006\00d\00B\006\006\000\00b\00a\00e\001\00c\006\00d\001\00b\002\00e\001\007\00e\00C\002\00A")
  (data (;14;) (i32.const 1532) "<")
  (data (;15;) (i32.const 1544) "\01\00\00\00&\00\00\00~\00l\00i\00b\00/\00a\00r\00r\00a\00y\00b\00u\00f\00f\00e\00r\00.\00t\00s")
  (data (;16;) (i32.const 1596) "<")
  (data (;17;) (i32.const 1608) "\01\00\00\00$\00\00\00I\00n\00d\00e\00x\00 \00o\00u\00t\00 \00o\00f\00 \00r\00a\00n\00g\00e")
  (data (;18;) (i32.const 1660) "<")
  (data (;19;) (i32.const 1672) "\01\00\00\00$\00\00\00~\00l\00i\00b\00/\00t\00y\00p\00e\00d\00a\00r\00r\00a\00y\00.\00t\00s")
  (data (;20;) (i32.const 1724) "<")
  (data (;21;) (i32.const 1736) "\01\00\00\00 \00\00\00d\00e\00f\00a\00u\00l\00t\00_\00l\00o\00g\00_\00t\00y\00p\00e")
  (data (;22;) (i32.const 1788) "\9c")
  (data (;23;) (i32.const 1800) "\01\00\00\00\86\00\00\00Y\00o\00u\00 \00c\00a\00n\00'\00t\00 \00m\00o\00d\00i\00f\00y\00 \00a\00 \00M\00o\00c\00k\00e\00d\00F\00u\00n\00c\00t\00i\00o\00n\00 \00i\00n\00s\00t\00a\00n\00c\00e\00 \00a\00f\00t\00e\00r\00 \00i\00t\00 \00h\00a\00s\00 \00b\00e\00e\00n\00 \00s\00a\00v\00e\00d\00.")
  (data (;24;) (i32.const 1948) "l")
  (data (;25;) (i32.const 1960) "\01\00\00\00T\00\00\000\00x\00a\008\001\008\00b\004\00f\001\001\001\00c\00c\00a\00c\007\00a\00a\003\001\00d\000\00b\00c\00c\000\008\000\006\00d\006\004\00f\002\00e\000\007\003\007\00d\007")
  (data (;26;) (i32.const 2060) "l")
  (data (;27;) (i32.const 2072) "\01\00\00\00T\00\00\000\00x\009\00C\005\008\00B\00A\00c\00C\003\003\001\00c\009\00a\00a\008\007\001\00A\00F\00D\008\000\002\00D\00B\006\003\007\009\00a\009\008\00e\008\000\00C\00E\00d\00b")
  (data (;28;) (i32.const 2172) "\1c")
  (data (;29;) (i32.const 2184) "\01\00\00\00\0a\00\00\00E\00R\00C\002\000")
  (data (;30;) (i32.const 2204) "\1c")
  (data (;31;) (i32.const 2216) "\01\00\00\00\02\00\00\000")
  (data (;32;) (i32.const 2236) "\1c")
  (data (;33;) (i32.const 2248) "\01\00\00\00\02\00\00\001")
  (data (;34;) (i32.const 2268) "\5c")
  (data (;35;) (i32.const 2280) "\01\00\00\00H\00\00\00C\00a\00n\00 \00c\00a\00l\00l\00 \00m\00a\00p\00p\00i\00n\00g\00s\00 \00w\00i\00t\00h\00 \00c\00u\00s\00t\00o\00m\00 \00e\00v\00e\00n\00t\00s")
  (data (;36;) (i32.const 2364) "\1c")
  (data (;37;) (i32.const 2376) "\01\00\00\00\04\00\00\00i\00d")
  (data (;38;) (i32.const 2396) "|")
  (data (;39;) (i32.const 2408) "\01\00\00\00^\00\00\00E\00l\00e\00m\00e\00n\00t\00 \00t\00y\00p\00e\00 \00m\00u\00s\00t\00 \00b\00e\00 \00n\00u\00l\00l\00a\00b\00l\00e\00 \00i\00f\00 \00a\00r\00r\00a\00y\00 \00i\00s\00 \00h\00o\00l\00e\00y")
  (data (;40;) (i32.const 2524) ",")
  (data (;41;) (i32.const 2536) "\01\00\00\00\14\00\00\00v\00o\00t\00e\00W\00e\00i\00g\00h\00t")
  (data (;42;) (i32.const 2572) "\1c")
  (data (;43;) (i32.const 2584) "\01\00\00\00\06\00\00\00g\00n\00o")
  (data (;44;) (i32.const 2604) "\1c")
  (data (;45;) (i32.const 2616) "\01\00\00\00\08\00\00\00m\00g\00n\00o")
  (data (;46;) (i32.const 2636) "\1c")
  (data (;47;) (i32.const 2648) "\01\00\00\00\08\00\00\00l\00g\00n\00o")
  (data (;48;) (i32.const 2668) ",")
  (data (;49;) (i32.const 2680) "\01\00\00\00\0e\00\00\00d\00e\00p\00o\00s\00i\00t")
  (data (;50;) (i32.const 2716) ",")
  (data (;51;) (i32.const 2728) "\01\00\00\00\16\00\00\00g\00r\00a\00v\00a\00t\00a\00r\00I\00d\000")
  (data (;52;) (i32.const 2764) "\5c")
  (data (;53;) (i32.const 2776) "\01\00\00\00J\00\00\00C\00a\00n\00n\00o\00t\00 \00s\00a\00v\00e\00 \00U\00s\00e\00r\00 \00e\00n\00t\00i\00t\00y\00 \00w\00i\00t\00h\00o\00u\00t\00 \00a\00n\00 \00I\00D")
  (data (;54;) (i32.const 2860) "<")
  (data (;55;) (i32.const 2872) "\01\00\00\00&\00\00\00g\00e\00n\00e\00r\00a\00t\00e\00d\00/\00s\00c\00h\00e\00m\00a\00.\00t\00s")
  (data (;56;) (i32.const 2924) "l")
  (data (;57;) (i32.const 2936) "\01\00\00\00X\00\00\00C\00a\00n\00n\00o\00t\00 \00s\00a\00v\00e\00 \00U\00s\00e\00r\00 \00e\00n\00t\00i\00t\00y\00 \00w\00i\00t\00h\00 \00n\00o\00n\00-\00s\00t\00r\00i\00n\00g\00 \00I\00D\00.\00 ")
  (data (;58;) (i32.const 3036) "\8c")
  (data (;59;) (i32.const 3048) "\01\00\00\00v\00\00\00C\00o\00n\00s\00i\00d\00e\00r\00i\00n\00g\00 \00u\00s\00i\00n\00g\00 \00.\00t\00o\00H\00e\00x\00(\00)\00 \00t\00o\00 \00c\00o\00n\00v\00e\00r\00t\00 \00t\00h\00e\00 \00\22\00i\00d\00\22\00 \00t\00o\00 \00a\00 \00s\00t\00r\00i\00n\00g\00.")
  (data (;60;) (i32.const 3180) "\1c")
  (data (;61;) (i32.const 3192) "\01")
  (data (;62;) (i32.const 3212) "\1c")
  (data (;63;) (i32.const 3224) "\01\00\00\00\08\00\00\00U\00s\00e\00r")
  (data (;64;) (i32.const 3244) "<")
  (data (;65;) (i32.const 3256) "\01\00\00\00,\00\00\00V\00a\00l\00u\00e\00 \00i\00s\00 \00n\00o\00t\00 \00a\00 \00s\00t\00r\00i\00n\00g\00.")
  (data (;66;) (i32.const 3308) "l")
  (data (;67;) (i32.const 3320) "\01\00\00\00X\00\00\00~\00l\00i\00b\00/\00@\00g\00r\00a\00p\00h\00p\00r\00o\00t\00o\00c\00o\00l\00/\00g\00r\00a\00p\00h\00-\00t\00s\00/\00c\00o\00m\00m\00o\00n\00/\00v\00a\00l\00u\00e\00.\00t\00s")
  (data (;68;) (i32.const 3420) "l")
  (data (;69;) (i32.const 3432) "\01\00\00\00T\00\00\000\00x\008\009\002\000\005\00A\003\00A\003\00b\002\00A\006\009\00D\00e\006\00D\00b\00f\007\00f\000\001\00E\00D\001\003\00B\002\001\000\008\00B\002\00c\004\003\00e\007")
  (data (;70;) (i32.const 3532) "\1c")
  (data (;71;) (i32.const 3544) "\01\00\00\00\08\00\00\000\00x\000\001")
  (data (;72;) (i32.const 3564) "\1c")
  (data (;73;) (i32.const 3596) ",")
  (data (;74;) (i32.const 3608) "\01\00\00\00\16\00\00\00f\00r\00o\00m\00A\00d\00d\00r\00e\00s\00s")
  (data (;75;) (i32.const 3644) "\5c")
  (data (;76;) (i32.const 3656) "\01\00\00\00J\00\00\00A\00d\00d\00r\00e\00s\00s\00 \00m\00u\00s\00t\00 \00c\00o\00n\00t\00a\00i\00n\00 \00e\00x\00a\00c\00t\00l\00y\00 \002\000\00 \00b\00y\00t\00e\00s")
  (data (;77;) (i32.const 3740) "l")
  (data (;78;) (i32.const 3752) "\01\00\00\00\5c\00\00\00~\00l\00i\00b\00/\00@\00g\00r\00a\00p\00h\00p\00r\00o\00t\00o\00c\00o\00l\00/\00g\00r\00a\00p\00h\00-\00t\00s\00/\00c\00h\00a\00i\00n\00/\00e\00t\00h\00e\00r\00e\00u\00m\00.\00t\00s")
  (data (;79;) (i32.const 3852) ",")
  (data (;80;) (i32.const 3864) "\01\00\00\00\12\00\00\00t\00o\00A\00d\00d\00r\00e\00s\00s")
  (data (;81;) (i32.const 3900) "\1c")
  (data (;82;) (i32.const 3912) "\01\00\00\00\0a\00\00\00v\00a\00l\00u\00e")
  (data (;83;) (i32.const 3932) "\1c")
  (data (;84;) (i32.const 3944) "\01\00\00\00\08\00\00\00d\00a\00t\00a")
  (data (;85;) (i32.const 3964) "\5c")
  (data (;86;) (i32.const 3976) "\01\00\00\00@\00\00\00E\00t\00h\00e\00r\00e\00u\00m\00 \00v\00a\00l\00u\00e\00 \00i\00s\00 \00n\00o\00t\00 \00a\00n\00 \00a\00d\00d\00r\00e\00s\00s")
  (data (;87;) (i32.const 4060) "<")
  (data (;88;) (i32.const 4072) "\01\00\00\00\1e\00\00\00u\00n\00e\00x\00p\00e\00c\00t\00e\00d\00 \00n\00u\00l\00l")
  (data (;89;) (i32.const 4124) "<")
  (data (;90;) (i32.const 4136) "\01\00\00\00,\00\00\00V\00a\00l\00u\00e\00 \00i\00s\00 \00n\00o\00t\00 \00a\00 \00B\00i\00g\00I\00n\00t\00.")
  (data (;91;) (i32.const 4188) "\5c")
  (data (;92;) (i32.const 4200) "\01\00\00\00J\00\00\00E\00t\00h\00e\00r\00e\00u\00m\00 \00v\00a\00l\00u\00e\00 \00i\00s\00 \00n\00o\00t\00 \00a\00n\00 \00i\00n\00t\00 \00o\00r\00 \00u\00i\00n\00t\00.")
  (data (;93;) (i32.const 4284) "\8c")
  (data (;94;) (i32.const 4296) "\01\00\00\00v\00\00\00F\00a\00i\00l\00e\00d\00 \00t\00o\00 \00s\00u\00b\00t\00r\00a\00c\00t\00 \00B\00i\00g\00I\00n\00t\00s\00 \00b\00e\00c\00a\00u\00s\00e\00 \00l\00e\00f\00t\00 \00h\00a\00n\00d\00 \00s\00i\00d\00e\00 \00i\00s\00 \00'\00n\00u\00l\00l\00'")
  (data (;95;) (i32.const 4428) "l")
  (data (;96;) (i32.const 4440) "\01\00\00\00\5c\00\00\00~\00l\00i\00b\00/\00@\00g\00r\00a\00p\00h\00p\00r\00o\00t\00o\00c\00o\00l\00/\00g\00r\00a\00p\00h\00-\00t\00s\00/\00c\00o\00m\00m\00o\00n\00/\00n\00u\00m\00b\00e\00r\00s\00.\00t\00s")
  (data (;97;) (i32.const 4540) "|")
  (data (;98;) (i32.const 4552) "\01\00\00\00l\00\00\00F\00a\00i\00l\00e\00d\00 \00t\00o\00 \00s\00u\00m\00 \00B\00i\00g\00I\00n\00t\00s\00 \00b\00e\00c\00a\00u\00s\00e\00 \00l\00e\00f\00t\00 \00h\00a\00n\00d\00 \00s\00i\00d\00e\00 \00i\00s\00 \00'\00n\00u\00l\00l\00'")
  (data (;99;) (i32.const 4668) "\1c")
  (data (;100;) (i32.const 4680) "\01\00\00\00\08\00\00\00t\00e\00s\00t")
  (data (;101;) (i32.const 4700) "<")
  (data (;102;) (i32.const 4712) "\01\00\00\00\1e\00\00\00A\00s\00s\00e\00r\00t\00i\00o\00n\00 \00E\00r\00r\00o\00r")
  (data (;103;) (i32.const 4764) "\5c")
  (data (;104;) (i32.const 4776) "\01\00\00\00J\00\00\00~\00l\00i\00b\00/\00m\00a\00t\00c\00h\00s\00t\00i\00c\00k\00-\00a\00s\00/\00a\00s\00s\00e\00m\00b\00l\00y\00/\00a\00s\00s\00e\00r\00t\00.\00t\00s")
  (data (;105;) (i32.const 4860) "\1c")
  (data (;106;) (i32.const 4872) "\1b\00\00\00\08\00\00\00\01"))
