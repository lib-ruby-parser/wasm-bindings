include codegen/build.mk
include build/build.mk
include tests/build.mk

clean:
	rm -rf $(CLEAN)
	touch codegen/build.rs
